const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Use the same database configuration as the main app
const pool = require('../src/db/index.js');

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      name TEXT,
      bio TEXT,
      location TEXT,
      phone TEXT,
      website TEXT,
      years_experience INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      category TEXT NOT NULL,
      seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      image TEXT,
      rating NUMERIC(2,1) DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS service_galleries (
      id SERIAL PRIMARY KEY,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
      quantity INTEGER DEFAULT 1,
      total NUMERIC(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function seed() {
  try {
    console.log('🌱 Inizio del seeding del database...');

    // Ensure schema exists, then clear existing data
    await ensureSchema();
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM services');
    await pool.query('DELETE FROM users');
    // Sequences will auto-increment from their current position

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert artisan users
    const artisans = [
      { 
        email: 'marco.orefice@artigiani.it', 
        username: 'marco_orefice', 
        name: 'Marco Benedetti',
        bio: 'Maestro orafo con oltre 20 anni di esperienza nella creazione di gioielli unici. Specializzato in anelli di fidanzamento e collane personalizzate.',
        location: 'Firenze, Toscana',
        phone: '+39 055 1234567',
        website: 'www.marcobenedetti-gioielli.it',
        years_experience: 20
      },
      { 
        email: 'sofia.sarta@artigiani.it', 
        username: 'sofia_sarta', 
        name: 'Sofia Rossi',
        bio: 'Stilista e sarta specializzata in alta moda italiana. Realizzo abiti su misura per occasioni speciali seguendo la tradizione sartoriale italiana.',
        location: 'Milano, Lombardia',
        phone: '+39 02 9876543',
        website: 'www.sofiarossi-moda.it',
        years_experience: 15
      },
      { 
        email: 'luca.mobile@artigiani.it', 
        username: 'luca_mobile', 
        name: 'Luca Falegname',
        bio: 'Ebanista e falegname di terza generazione. Creo mobili su misura in legno massello utilizzando tecniche tradizionali tramandate di padre in figlio.',
        location: 'Udine, Friuli-Venezia Giulia',
        phone: '+39 0432 555666',
        website: 'www.falegnamerialuca.it',
        years_experience: 25
      },
      { 
        email: 'anna.casa@artigiani.it', 
        username: 'anna_casa', 
        name: 'Anna Ferro',
        bio: 'Artigiana del ferro specializzata nella creazione di oggetti decorativi e funzionali per la casa. Lavoro il ferro battuto con tecniche antiche.',
        location: 'Bergamo, Lombardia',
        phone: '+39 035 777888',
        website: 'www.annaferro-artigiana.it',
        years_experience: 12
      },
      { 
        email: 'pietro.tempo@artigiani.it', 
        username: 'pietro_tempo', 
        name: 'Pietro Cronos',
        bio: 'Orologiaio esperto nel restauro e riparazione di orologi antichi e moderni. Passione per i meccanismi di precisione e la storia dell\'orologeria.',
        location: 'Roma, Lazio',
        phone: '+39 06 111222',
        website: 'www.pietrochronos.it',
        years_experience: 30
      },
      { 
        email: 'giulia.cibo@artigiani.it', 
        username: 'giulia_cibo', 
        name: 'Giulia Sapori',
        bio: 'Produttrice artigianale di salumi e formaggi tradizionali. Utilizzo solo ingredienti locali e ricette di famiglia tramandate da generazioni.',
        location: 'Parma, Emilia-Romagna',
        phone: '+39 0521 333444',
        website: 'www.giuliasapori.it',
        years_experience: 18
      },
      { 
        email: 'davide.attrezzi@artigiani.it', 
        username: 'davide_attrezzi', 
        name: 'Davide Fabbro',
        bio: 'Fabbro specializzato nella forgiatura di attrezzi da lavoro e utensili artigianali. Ogni pezzo è forgiato a mano seguendo antiche tecniche.',
        location: 'Brescia, Lombardia',
        phone: '+39 030 999000',
        website: 'www.davidefabbro.it',
        years_experience: 22
      },
      { 
        email: 'elena.ceramica@artigiani.it', 
        username: 'elena_ceramica', 
        name: 'Elena Ceramista',
        bio: 'Ceramista esperta nella produzione di piastrelle e oggetti decorativi in ceramica. Dipingo a mano ogni pezzo con motivi tradizionali italiani.',
        location: 'Faenza, Emilia-Romagna',
        phone: '+39 0546 666777',
        website: 'www.elenaceramica.it',
        years_experience: 16
      }
    ];

    const artisanIds = [];
    for (const artisan of artisans) {
      const result = await pool.query(
        'INSERT INTO users (email, username, password_hash, avatar, name, bio, location, phone, website, years_experience) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
        [
          artisan.email,
          artisan.username,
          hashedPassword,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${artisan.username}`,
          artisan.name,
          artisan.bio,
          artisan.location,
          artisan.phone,
          artisan.website,
          artisan.years_experience
        ]
      );
      artisanIds.push(result.rows[0].id);
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

    const serviceIds = [];
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const svcResult = await pool.query(
        'INSERT INTO services (title, description, price, category, seller_id, image, rating, reviews_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [
          service.title,
          service.description,
          service.price,
          service.category,
          artisanIds[service.seller_id - 1],
          service.image,
          (Math.random() * 2 + 3).toFixed(1),
          Math.floor(Math.random() * 50) + 5
        ]
      );
      serviceIds.push(svcResult.rows[0].id);
    }

    console.log('✅ Servizi artigianali creati con successo');

    // Insert service galleries
    const galleries = [
      // Gioielleria - Marco
      { service_index: 0, images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
      ]},
      { service_index: 1, images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
        'https://images.unsplash.com/photo-1596944946330-b37b7797f3ca?w=400'
      ]},
      // Design abbigliamento - Sofia
      { service_index: 2, images: [
        'https://images.unsplash.com/photo-1566479179817-c8723ee8a56e?w=400',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400',
        'https://images.unsplash.com/photo-1594938392931-1d179134e295?w=400'
      ]},
      { service_index: 3, images: [
        'https://images.unsplash.com/photo-1594938392931-1d179134e295?w=400',
        'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
      ]},
      // Ebanisteria - Luca (services 4, 5)
      { service_index: 4, images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
      ]},
      { service_index: 5, images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1616627433291-8dd7bab45c78?w=400',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
      ]},
      // Design oggetti casa - Anna (services 6, 7)
      { service_index: 6, images: [
        'https://images.unsplash.com/photo-1540379008-b9f8f2c6f994?w=400',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        'https://images.unsplash.com/photo-1521100730256-28f30f6bb78b?w=400'
      ]},
      { service_index: 7, images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
        'https://images.unsplash.com/photo-1471919743851-c4df8b6eead?w=400'
      ]},
      // Orologeria - Pietro (services 8, 9)
      { service_index: 8, images: [
        'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
        'https://images.unsplash.com/photo-1495856458515-0637185db551?w=400'
      ]},
      { service_index: 9, images: [
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
        'https://images.unsplash.com/photo-1509048191080-d2e617282156?w=400'
      ]},
      // Produzione alimentare - Giulia (services 10, 11)
      { service_index: 10, images: [
        'https://images.unsplash.com/photo-1567171515071-0c8c1d9ae1c7?w=400',
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
      ]},
      { service_index: 11, images: [
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
        'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400'
      ]},
      // Fabbricazione attrezzi - Davide (services 12, 13)
      { service_index: 12, images: [
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        'https://images.unsplash.com/photo-1521100730256-28f30f6bb78b?w=400',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'
      ]},
      { service_index: 13, images: [
        'https://images.unsplash.com/photo-1521100730256-28f30f6bb78b?w=400',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
        'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400'
      ]},
      // Piastrelle - Elena (services 14, 15)
      { service_index: 14, images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
        'https://images.unsplash.com/photo-1571055107494-8d1b38da69a6?w=400',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
      ]},
      { service_index: 15, images: [
        'https://images.unsplash.com/photo-1571055107494-8d1b38da69a6?w=400',
        'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400',
        'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=400'
      ]}
    ];

    for (const gallery of galleries) {
      const serviceId = serviceIds[gallery.service_index];
      for (let i = 0; i < gallery.images.length; i++) {
        await pool.query(
          'INSERT INTO service_galleries (service_id, image_url, display_order) VALUES ($1, $2, $3)',
          [serviceId, gallery.images[i], i]
        );
      }
    }

    console.log('✅ Gallerie servizi create con successo');

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
        const randomUserId = artisanIds[Math.floor(Math.random() * artisanIds.length)];
        const randomServiceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
        const randomReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
        
        await pool.query(
          'INSERT INTO reviews (user_id, service_id, rating, comment) VALUES ($1, $2, $3, $4)',
          [randomUserId, randomServiceId, Math.floor(Math.random() * 2) + 4, randomReview]
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
    // Don't end the pool here since we're using the shared connection
    console.log('✅ Seeding completato!');
  }
}

// Run seeding
seed();