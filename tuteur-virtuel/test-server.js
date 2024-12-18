const express = require('express');
const axios = require('axios');

const app = express();
const port = 3001;

app.use(express.json());

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const cleanResponse = (text) => {
    return text
        .replace(/\*\*/g, '')
        .replace('Question :', '')
        .replace('Réponse :', '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const askOllama = async (prompt) => {
    try {
        console.log('Envoi de la requête à Ollama:', prompt);
        const response = await axios.post(OLLAMA_API_URL, {
            model: 'llama3',
            prompt: `Instructions: RÉPONDS EN FRANÇAIS AVEC UNE SEULE QUESTION SIMPLE.\n${prompt}`,
            stream: false
        });
        return cleanResponse(response.data.response);
    } catch (error) {
        console.error('Erreur Ollama:', error.message);
        throw error;
    }
};

app.post('/api/alexa', async (req, res) => {
    try {
        console.log('Requête reçue:', JSON.stringify(req.body, null, 2));

        const requestType = req.body.request.type;
        const intentName = req.body.request.intent?.name;

        let response = {
            version: '1.0',
            response: {
                outputSpeech: {
                    type: 'SSML',
                    ssml: '<speak>Désolé, je ne comprends pas cette demande.</speak>'
                },
                shouldEndSession: false
            }
        };

        // Gestion du LaunchRequest
        if (requestType === 'LaunchRequest') {
            response.response.outputSpeech.ssml = '<speak>Bienvenue dans le Tuteur Virtuel ! Je peux t\'aider avec tes devoirs ou te faire faire un petit quiz. Que voudrais-tu faire ? Tu peux dire par exemple "aide-moi avec les mathématiques" ou "je veux faire un quiz".</speak>';
            response.response.reprompt = {
                outputSpeech: {
                    type: 'SSML',
                    ssml: '<speak>Tu peux dire "aide-moi avec les mathématiques" ou "je veux faire un quiz".</speak>'
                }
            };
        }
        // Gestion des IntentRequest
        else if (requestType === 'IntentRequest') {
            if (intentName === 'QuizIntent') {
                const subject = req.body.request.intent.slots?.subject?.value || 'culture générale';
                
                let prompt;
                if (subject === 'mathématiques') {
                    prompt = `Pose une question de calcul mental très simple pour un enfant de 7-8 ans.
                    Utilise des nombres entre 1 et 10.
                    Format souhaité: "Combien font 3 plus 4 ?"`;
                } else {
                    prompt = `Pose une question simple sur ${subject} pour un enfant de 7-8 ans.
                    La question doit avoir une réponse évidente d'un seul mot.
                    Exemple format: "Quelle est la couleur du ciel ?"`;
                }
                
                const ollamaResponse = await askOllama(prompt);
                response.response.outputSpeech.ssml = `<speak>${ollamaResponse}</speak>`;
                response.response.reprompt = {
                    outputSpeech: {
                        type: 'SSML',
                        ssml: '<speak>Alors, quelle est ta réponse ?</speak>'
                    }
                };
            }
            else if (intentName === 'HelpHomeworkIntent') {
                const subject = req.body.request.intent.slots?.subject?.value;
                const question = req.body.request.intent.slots?.question?.value;

                const prompt = `Tu es un enseignant pour enfant de 7-8 ans.
                    Explique simplement : ${question || subject}.
                    Important : Une seule phrase d'explication suivie d'UN exemple avec des petits nombres.
                    Format souhaité : "L'addition c'est mettre des choses ensemble, par exemple si tu as 2 bonbons et tu en reçois 1, tu as 3 bonbons."`;

                const ollamaResponse = await askOllama(prompt);
                response.response.outputSpeech.ssml = `<speak>${ollamaResponse}</speak>`;
                response.response.reprompt = {
                    outputSpeech: {
                        type: 'SSML',
                        ssml: '<speak>As-tu besoin d\'autres explications ?</speak>'
                    }
                };
            }
        }

        console.log('Réponse envoyée:', JSON.stringify(response, null, 2));
        res.json(response);

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            version: '1.0',
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: 'Désolé, une erreur est survenue.'
                },
                shouldEndSession: true
            }
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const server = app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
}).on('error', (err) => {
    console.error('Erreur au démarrage du serveur:', err);
});