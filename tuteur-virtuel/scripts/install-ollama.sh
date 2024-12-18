#!/bin/bash

echo "Installation d'Ollama 3.2 pour macOS..."

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "Installation de Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Télécharger Ollama 3.2 pour macOS
curl -L https://ollama.ai/download/Ollama-darwin-3.2.dmg -o Ollama.dmg

# Monter l'image DMG
echo "Montage de l'image DMG..."
hdiutil attach Ollama.dmg

# Copier l'application
echo "Installation d'Ollama..."
cp -R "/Volumes/Ollama/Ollama.app" /Applications/

# Démonter l'image DMG
echo "Nettoyage..."
hdiutil detach "/Volumes/Ollama"
rm Ollama.dmg

# Créer le répertoire de configuration
mkdir -p ~/.ollama

# Copier la configuration
echo "Configuration d'Ollama..."
if [ ! -f ~/.ollama/config.json ]; then
    cp ../scripts/ollama-config.json ~/.ollama/config.json
fi

echo "Installation terminée !"
echo "Pour démarrer Ollama, ouvrez l'application depuis le dossier Applications"