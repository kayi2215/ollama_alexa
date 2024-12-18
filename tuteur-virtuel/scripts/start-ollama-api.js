const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuration
app.use(cors());
app.use(express.json());

// Fonction utilitaire pour exécuter Ollama avec llama3.2
function runOllama(prompt) {
    return new Promise((resolve, reject) => {
        // Échapper les caractères spéciaux dans le prompt
        const escapedPrompt = prompt.replace(/"/g, '\\"');
        
        // Utilisation spécifique de llama3.2
        const command = `ollama run llama3 "${escapedPrompt}"`;
        console.log('Executing command:', command);
        
        exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur exec:', error);
                reject(error);
                return;
            }
            
            if (stderr) {
                console.error('Stderr:', stderr);
            }
            
            resolve(stdout.trim());
        });
    });
}

// Route pour les requêtes de génération
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Le prompt est requis' });
        }
        
        console.log('Prompt reçu:', prompt);
        
        const response = await runOllama(prompt);
        console.log('Réponse:', response);
        
        res.json({
            response: response,
            model: 'llama3'
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la génération',
            details: error.message
        });
    }
});

// Route de vérification de santé
app.get('/health', async (req, res) => {
    try {
        // Tester spécifiquement llama3.2
        const response = await runOllama("Réponds juste 'OK' si tu fonctionnes.");
        res.json({ 
            status: 'ok', 
            model: 'llama3',
            test_response: response
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Modèle non disponible',
            error: error.message 
        });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`API Ollama (llama3) en écoute sur le port ${port}`);
    console.log('Pour tester l\'API:');
    console.log('curl -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d \'{"prompt": "Explique-moi les mathématiques comme à un enfant de 7 ans"}\'');
});