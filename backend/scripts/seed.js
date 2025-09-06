const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://mario_user:mario_password@localhost:5432/mario_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  try {
    console.log('🌱 Inizio del seeding del database...');

    // Clear existing data
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM services');
    await pool.query('DELETE FROM users');

    // Reset auto-increment sequences
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE services_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE reviews_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE orders_id_seq RESTART WITH 1');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert artisan users
    const artisans = [
      { email: 'marco.orefice@artigiani.it', username: 'marco_orefice', name: 'Marco Benedetti' },
      { email: 'sofia.sarta@artigiani.it', username: 'sofia_sarta', name: 'Sofia Rossi' },
      { email: 'luca.mobile@artigiani.it', username: 'luca_mobile', name: 'Luca Falegname' },
      { email: 'anna.casa@artigiani.it', username: 'anna_casa', name: 'Anna Ferro' },
      { email: 'pietro.tempo@artigiani.it', username: 'pietro_tempo', name: 'Pietro Cronos' },
      { email: 'giulia.cibo@artigiani.it', username: 'giulia_cibo', name: 'Giulia Sapori' },
      { email: 'davide.attrezzi@artigiani.it', username: 'davide_attrezzi', name: 'Davide Fabbro' },
      { email: 'elena.ceramica@artigiani.it', username: 'elena_ceramica', name: 'Elena Ceramista' }
    ];

    for (const artisan of artisans) {
      await pool.query(
        'INSERT INTO users (email, username, password_hash, avatar) VALUES ($1, $2, $3, $4)',
        [
          artisan.email,
          artisan.username,
          hashedPassword,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${artisan.username}`
        ]
      );
    }

    console.log('✅ Artigiani creati con successo');

    // Insert Italian artisan services
    const services = [
      // Gioielleria
      {
        title: 'Anello di fidanzamento su misura',
        description: 'Creo anelli di fidanzamento unici con diamanti selezionati e metalli preziosi. Ogni pezzo è realizzato a mano con tecniche tradizionali della gioielleria italiana.',
        price: 2500.00,
        category: 'Gioielleria',
        seller_id: 1,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'
      },
      {
        title: 'Collana in argento lavorata a mano',
        description: 'Elegante collana in argento 925 con pendente in pietre semi-preziose. Lavorazione artigianale con tecniche di filigrana tradizionale.',
        price: 450.00,
        category: 'Gioielleria',
        seller_id: 1,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
      },

      // Design di abbigliamento
      {
        title: 'Abito da sera su misura',
        description: 'Realizzo abiti da sera eleganti e raffinati, completamente su misura. Utilizzo tessuti pregiati e tecniche sartoriali tradizionali italiane.',
        price: 1800.00,
        category: 'Design di abbigliamento',
        seller_id: 2,
        image: 'https://images.unsplash.com/photo-1566479179817-c8723ee8a56e?w=400'
      },
      {
        title: 'Camicia artigianale in lino',
        description: 'Camicia elegante in lino italiano di alta qualità, tagliata e cucita a mano. Perfetta per ogni occasione, con dettagli raffinati.',
        price: 280.00,
        category: 'Design di abbigliamento',
        seller_id: 2,
        image: 'https://images.unsplash.com/photo-1594938392931-1d179134e295?w=400'
      },

      // Ebanisteria
      {
        title: 'Tavolo da pranzo in legno massello',
        description: 'Tavolo da pranzo realizzato in legno di noce massello, con finitura a mano e gambe tornite. Dimensioni personalizzabili secondo le vostre esigenze.',
        price: 3200.00,
        category: 'Ebanisteria',
        seller_id: 3,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
      },
      {
        title: 'Libreria su misura',
        description: 'Libreria modulare in legno di rovere, progettata e realizzata su misura per il vostro spazio. Ogni ripiano è regolabile e rifinito a mano.',
        price: 2100.00,
        category: 'Ebanisteria',
        seller_id: 3,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },

      // Design di oggetti per la casa
      {
        title: 'Set di coltelli da cucina forgiati',
        description: 'Set completo di coltelli da cucina forgiati a mano in acciaio al carbonio. Include coltello da chef, da pane, da verdure e spelucchino.',
        price: 680.00,
        category: 'Design di oggetti per la casa',
        seller_id: 4,
        image: 'https://images.unsplash.com/photo-1540379008-b9f8f2c6f994?w=400'
      },
      {
        title: 'Lampada da tavolo in ferro battuto',
        description: 'Elegante lampada da tavolo realizzata in ferro battuto con paralume in tessuto naturale. Perfetta per ambienti rustici ed eleganti.',
        price: 340.00,
        category: 'Design di oggetti per la casa',
        seller_id: 4,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      },

      // Orologeria
      {
        title: 'Orologio da tavolo meccanico',
        description: 'Orologio da tavolo con movimento meccanico completamente restaurato e calibrato. Cassa in legno pregiato con intarsi decorativi.',
        price: 1200.00,
        category: 'Orologeria',
        seller_id: 5,
        image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400'
      },
      {
        title: 'Restauro orologio da polso vintage',
        description: 'Servizio professionale di restauro per orologi da polso vintage. Include revisione del movimento, sostituzione parti usurate e lucidatura cassa.',
        price: 450.00,
        category: 'Orologeria',
        seller_id: 5,
        image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400'
      },

      // Produzione alimentare
      {
        title: 'Salumi artigianali della tradizione',
        description: 'Produzione artigianale di salumi tradizionali italiani: prosciutto, salame, pancetta. Stagionatura naturale e ingredienti selezionati.',
        price: 85.00,
        category: 'Produzione alimentare',
        seller_id: 6,
        image: 'https://images.unsplash.com/photo-1567171515071-0c8c1d9ae1c7?w=400'
      },
      {
        title: 'Formaggi freschi di capra',
        description: 'Formaggi freschi prodotti con latte di capra locale, seguendo ricette tradizionali familiari. Disponibili diverse stagionature.',
        price: 65.00,
        category: 'Produzione alimentare',
        seller_id: 6,
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'
      },

      // Fabbricazione di attrezzi
      {
        title: 'Attrezzi da giardino forgiati',
        description: 'Set di attrezzi da giardino forgiati a mano: zappa, vanga, rastrello. Manici in legno di frassino stagionato, ferro battuto di qualità.',
        price: 320.00,
        category: 'Fabbricazione di attrezzi',
        seller_id: 7,
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
      },
      {
        title: 'Utensili da falegnameria tradizionali',
        description: 'Creazione e restauro di utensili da falegnameria tradizionali: pialle, scalpelli, seghe. Lavorazione secondo antiche tecniche artigianali.',
        price: 150.00,
        category: 'Fabbricazione di attrezzi',
        seller_id: 7,
        image: 'https://images.unsplash.com/photo-1521100730256-28f30f6bb78b?w=400'
      },

      // Fabbricazione di piastrelle
      {
        title: 'Piastrelle in ceramica dipinte a mano',
        description: 'Piastrelle decorative in ceramica dipinte completamente a mano con motivi tradizionali italiani. Perfette per cucine e bagni di pregio.',
        price: 45.00,
        category: 'Fabbricazione di piastrelle',
        seller_id: 8,
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'
      },
      {
        title: 'Mattonelle in cotto fatto a mano',
        description: 'Mattonelle in cotto prodotte con argilla locale e cotte in forno a legna. Superficie naturale e irregolare, perfette per ambienti rustici.',
        price: 28.00,
        category: 'Fabbricazione di piastrelle',
        seller_id: 8,
        image: 'https://images.unsplash.com/photo-1571055107494-8d1b38da69a6?w=400'
      }
    ];

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      await pool.query(
        'INSERT INTO services (title, description, price, category, seller_id, image, rating, reviews_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          service.title,
          service.description,
          service.price,
          service.category,
          service.seller_id,
          service.image,
          (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0-5.0
          Math.floor(Math.random() * 50) + 5  // Reviews between 5-55
        ]
      );
    }

    console.log('✅ Servizi artigianali creati con successo');

    // Insert sample reviews
    const reviewTexts = [
      'Lavoro eccezionale, qualità artigianale straordinaria!',
      'Prodotto bellissimo, consegna puntuale. Consigliatissimo!',
      'Artigiano molto professionale, risultato oltre le aspettative.',
      'Qualità premium, vale ogni centesimo speso.',
      'Attenzione ai dettagli incredibile, sono rimasto stupefatto.',
      'Tradizione italiana al suo meglio, prodotto magnifico.',
      'Servizio impeccabile dall\'inizio alla fine.',
      'Artigianato di altissimo livello, lo rifarei sicuramente.'
    ];

    // Add some reviews for services
    for (let i = 1; i <= 8; i++) {
      const numReviews = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numReviews; j++) {
        const randomUser = Math.floor(Math.random() * 8) + 1;
        const randomService = Math.floor(Math.random() * services.length) + 1;
        const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        
        await pool.query(
          'INSERT INTO reviews (user_id, service_id, rating, comment) VALUES ($1, $2, $3, $4)',
          [randomUser, randomService, Math.floor(Math.random() * 2) + 4, randomReview]
        );
      }
    }

    console.log('✅ Recensioni create con successo');
    console.log('🎉 Seeding completato! Database pronto per artigiani italiani.');
    console.log('\n📧 Account di test:');
    console.log('Email: marco.orefice@artigiani.it');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
  } finally {
    await pool.end();
  }
}

// Run seeding
seed();