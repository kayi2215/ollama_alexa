const Alexa = require('ask-sdk-core');
const axios = require('axios');

// Configuration de l'API Ollama
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

// Fonction utilitaire pour appeler Ollama
const askOllama = async (prompt) => {
    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: 'llama3',
            prompt: prompt,
            stream: false
        });
        return response.data.response;
    } catch (error) {
        console.error('Erreur lors de l\'appel à Ollama:', error);
        throw error;
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenue dans le Tuteur Virtuel ! Je peux t\'aider avec tes devoirs, répondre à tes questions ou faire un quiz. Que voudrais-tu faire ?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpHomeworkIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelpHomeworkIntent';
    },
    async handle(handlerInput) {
        const subject = Alexa.getSlotValue(handlerInput.requestEnvelope, 'subject');
        const question = Alexa.getSlotValue(handlerInput.requestEnvelope, 'question');
        
        try {
            const prompt = `Tu es un tuteur pédagogique pour enfant. Explique simplement et clairement: ${question || subject}. Utilise un langage adapté aux enfants et limite ta réponse à 2-3 phrases.`;
            const response = await askOllama(prompt);
            
            return handlerInput.responseBuilder
                .speak(response)
                .reprompt('As-tu besoin d\'autres explications ?')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Désolé, je n\'arrive pas à répondre pour le moment. Peux-tu reformuler ta question ?')
                .reprompt('Que voudrais-tu savoir ?')
                .getResponse();
        }
    }
};

const QuizIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizIntent';
    },
    async handle(handlerInput) {
        const subject = Alexa.getSlotValue(handlerInput.requestEnvelope, 'subject');
        
        try {
            const prompt = `Génère une question de quiz pour un enfant sur le sujet : ${subject || 'culture générale'}. La question doit être simple et courte.`;
            const response = await askOllama(prompt);
            
            return handlerInput.responseBuilder
                .speak(response)
                .reprompt('Quelle est ta réponse ?')
                .getResponse();
        } catch (error) {
            return handlerInput.responseBuilder
                .speak('Désolé, je ne peux pas générer de quiz pour le moment.')
                .reprompt('Veux-tu essayer autre chose ?')
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Tu peux me demander de t\'aider avec tes devoirs ou de faire un quiz. Par exemple, dis "aide-moi avec les maths" ou "je veux faire un quiz".';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Au revoir et à bientôt !';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpHomeworkIntentHandler,
        QuizIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .lambda();