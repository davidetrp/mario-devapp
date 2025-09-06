#!/bin/bash

echo "🌱 Popolamento database con dati artigiani italiani..."

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze backend..."
    npm install
fi

# Run the seed script
echo "🗃️ Esecuzione script di seeding..."
npm run seed

echo "✅ Database popolato con successo!"
echo ""
echo "🔑 Credenziali di test:"
echo "Email: marco.orefice@artigiani.it"
echo "Password: password123"
echo ""
echo "🚀 Avvia l'applicazione con: ./start-mario.sh"