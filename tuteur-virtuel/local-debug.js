// ... (code précédent inchangé jusqu'au HelpHomeworkIntentHandler)

const HelpHomeworkIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelpHomeworkIntent';
    },
    async handle(handlerInput) {
        try {
            const subject = Alexa.getSlotValue(handlerInput.requestEnvelope, 'subject');
            const question = Alexa.getSlotValue(handlerInput.requestEnvelope, 'question');
            
            console.log('Demande d\'aide pour:', subject, question);

            const prompt = `En tant qu'enseignant français pour enfant de 7-8 ans, explique de manière très simple et courte:
                ${question || subject}
                
                RÈGLES IMPORTANTES:
                1. Donne UN SEUL exemple simple avec des petits nombres (pas plus)
                2. Utilise maximum 2 phrases
                3. Reste positif mais bref
                4. Ne dis pas "Bon courage" ou d'autres encouragements
                
                Exemple de bonne réponse pour l'addition:
                "L'addition, c'est quand on met des choses ensemble ! Si tu as 2 bonbons et tu en reçois 1, maintenant tu as 3 bonbons."`;
            
            console.log('Envoi du prompt à Ollama:', prompt);
            const response = await askOllama(prompt);
            console.log('Réponse d\'Ollama:', response);

            if (!response) {
                throw new Error('Réponse vide d\'Ollama');
            }

            return handlerInput.responseBuilder
                .speak(response)
                .reprompt("As-tu besoin d'autres explications ?")
                .getResponse();
        } catch (error) {
            console.error('Erreur dans HelpHomeworkIntentHandler:', error);
            return handlerInput.responseBuilder
                .speak('Désolé, je n\'arrive pas à répondre pour le moment. Peux-tu reformuler ta question ?')
                .reprompt('Que voudrais-tu savoir ?')
                .getResponse();
        }
    }
};

// ... (reste du code inchangé)