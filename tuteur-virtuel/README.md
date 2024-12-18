# Tuteur Virtuel - Skill Alexa

Une Skill Alexa de tutorat connectée à Ollama pour aider les enfants dans leurs devoirs.

## Prérequis

- Node.js (v14 ou supérieur)
- Docker (pour Ollama)
- Compte Amazon Developer
- ASK CLI (Alexa Skills Kit Command Line Interface)

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Installer ASK CLI globalement :
   ```bash
   npm install -g ask-cli
   ask configure
   ```

3. Configurer Ollama :
   ```bash
   # Démarrer le conteneur Ollama
   npm run start-ollama

   # Télécharger le modèle LLaMA 2
   npm run pull-model
   ```

## Configuration

1. Créer un fichier `.env` avec les variables suivantes :
   ```
   OLLAMA_API_URL=http://localhost:11434/api/generate
   NODE_ENV=development
   ```

2. Mettre à jour `skill.json` avec votre ARN Lambda une fois créé.

## Déploiement

1. Initialiser le déploiement :
   ```bash
   ask init
   ```

2. Déployer la skill :
   ```bash
   npm run deploy
   ```

## Structure du Projet

- `lambda/index.js` : Code principal de la Skill
- `models/fr-FR.json` : Modèle d'interaction en français
- `skill.json` : Configuration de la Skill
- `.env` : Variables d'environnement

## Intents Supportés

- `HelpHomeworkIntent` : Aide aux devoirs
- `AskTeacherIntent` : Explications de cours
- `QuizIntent` : Mode quiz
- Intents standards (Help, Stop, Cancel)

## Utilisation

Les utilisateurs peuvent interagir avec la skill en disant :
- "Alexa, lance Tuteur Virtuel"
- "Aide-moi avec mes maths"
- "Explique-moi la photosynthèse"
- "Je veux faire un quiz"

## Débogage

Pour tester localement :
1. Utiliser le simulateur Alexa Developer Console
2. Vérifier les logs CloudWatch une fois déployé
3. Tester l'API Ollama :
   ```bash
   curl -X POST http://localhost:11434/api/generate -d '{
     "model": "llama2",
     "prompt": "Explique-moi les additions"
   }'
   ```