const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Contact = require('../models/Contact');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const StockOperation = require('../models/StockOperation');
const StockMovement = require('../models/StockMovement');
const PosSession = require('../models/PosSession');
const PosOrder = require('../models/PosOrder');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion_stock_db');
    console.log('Connecté à MongoDB pour le seed...');

    // Clear existing collections
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Contact.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await StockOperation.deleteMany({});
    await StockMovement.deleteMany({});
    await PosSession.deleteMany({});
    await PosOrder.deleteMany({});

    console.log('Base de données réinitialisée.');

    // 1. Categories
    const categories = await Category.insertMany([
      { name: 'Restauration & Fast-Food', icon: 'Utensils', color: '#E11D48' },
      { name: 'Boissons & Cafés', icon: 'Coffee', color: '#D97706' },
      { name: 'Épicerie & Ingrédients', icon: 'ShoppingBag', color: '#2563EB' },
      { name: 'Boulangerie & Pâtisserie', icon: 'Cake', color: '#7C3AED' },
      { name: 'Fournitures & Emballage', icon: 'Box', color: '#059669' }
    ]);

    // 2. Products with realistic Unsplash Moroccan food/store photos
    const products = await Product.insertMany([
      {
        name: 'Double Burger Boeuf Fromage',
        reference: 'BRG-DBL-01',
        barcode: '61110001001',
        category: 'Restauration & Fast-Food',
        price: 35.00,
        costPrice: 18.00,
        stock: 45,
        minStockAlert: 10,
        unit: 'Unités',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Sandwich Poulet Pané Crudités',
        reference: 'SND-PCH-02',
        barcode: '61110001002',
        category: 'Restauration & Fast-Food',
        price: 25.00,
        costPrice: 12.00,
        stock: 38,
        minStockAlert: 8,
        unit: 'Unités',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Pizza 4 Saisons Traditionnelle',
        reference: 'PIZ-4S-03',
        barcode: '61110001003',
        category: 'Restauration & Fast-Food',
        price: 45.00,
        costPrice: 22.00,
        stock: 24,
        minStockAlert: 5,
        unit: 'Unités',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Plat Saucisse Grillée & Salade',
        reference: 'PLT-SAUC-04',
        barcode: '61110001004',
        category: 'Restauration & Fast-Food',
        price: 30.00,
        costPrice: 15.00,
        stock: 29,
        minStockAlert: 5,
        unit: 'Unités',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Portion Frites Croustillantes',
        reference: 'ACC-FRIT-05',
        barcode: '61110001005',
        category: 'Restauration & Fast-Food',
        price: 12.00,
        costPrice: 4.50,
        stock: 75,
        minStockAlert: 15,
        unit: 'Portions',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Plat Crevettes Pil-Pil Marocain',
        reference: 'PLT-CREV-06',
        barcode: '61110001006',
        category: 'Restauration & Fast-Food',
        price: 65.00,
        costPrice: 38.00,
        stock: 16,
        minStockAlert: 5,
        unit: 'Plats',
        imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Soda Canette 33cl (Coca / Sprite / Fanta)',
        reference: 'BOIS-SODA-07',
        barcode: '61110001007',
        category: 'Boissons & Cafés',
        price: 7.00,
        costPrice: 3.80,
        stock: 120,
        minStockAlert: 25,
        unit: 'Canettes',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Eau Minérale Sidi Ali 0.5L',
        reference: 'BOIS-EAU-08',
        barcode: '61110001008',
        category: 'Boissons & Cafés',
        price: 4.00,
        costPrice: 2.10,
        stock: 150,
        minStockAlert: 30,
        unit: 'Bouteilles',
        imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ac5cd76e2?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Café Espresso Illy',
        reference: 'BOIS-CAF-09',
        barcode: '61110001009',
        category: 'Boissons & Cafés',
        price: 15.00,
        costPrice: 4.00,
        stock: 90,
        minStockAlert: 20,
        unit: 'Tasses',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Jus d’Orange Frais Pressé',
        reference: 'BOIS-JUS-10',
        barcode: '61110001010',
        category: 'Boissons & Cafés',
        price: 18.00,
        costPrice: 7.00,
        stock: 35,
        minStockAlert: 10,
        unit: 'Verres',
        imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Plateau Oeufs Frais Beldi (30 pcs)',
        reference: 'EPI-OEUF-11',
        barcode: '61110001011',
        category: 'Épicerie & Ingrédients',
        price: 45.00,
        costPrice: 32.00,
        stock: 4, // Alerte stock bas !
        minStockAlert: 8,
        unit: 'Plateaux',
        imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&auto=format&fit=crop&q=60'
      },
      {
        name: 'Viande Hachée Pur Boeuf (1 Kg)',
        reference: 'EPI-BOEUF-12',
        barcode: '61110001012',
        category: 'Épicerie & Ingrédients',
        price: 95.00,
        costPrice: 75.00,
        stock: 3, // Alerte stock bas !
        minStockAlert: 6,
        unit: 'Kg',
        imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop&q=60'
      }
    ]);

    // 3. Contacts (Clients & Fournisseurs - matching the Moroccan demo video)
    const contacts = await Contact.insertMany([
      {
        name: 'COMMUNE DE RABAT',
        type: 'client',
        isCompany: true,
        email: 'marches@communerabat.ma',
        phone: '+212 537 20 11 22',
        address: 'Place Al Joulane, Hassan',
        city: 'Rabat',
        ice: '001523490000045',
        if: '40192837',
        rc: '19482 RABAT',
        totalDue: 890.00
      },
      {
        name: 'SOCIÉTÉ MAGHREB TECH SARL',
        type: 'client',
        isCompany: true,
        email: 'contact@maghrebtech.ma',
        phone: '+212 522 98 44 10',
        address: '142 Bd Zerktouni, 4ème étage',
        city: 'Casablanca',
        ice: '002341908000088',
        if: '51203948',
        rc: '83920 CASA',
        totalDue: 0.00
      },
      {
        name: 'HÔTEL ROYAL ATLAS PALACE',
        type: 'client',
        isCompany: true,
        email: 'achats@royalatlas.ma',
        phone: '+212 524 43 00 90',
        address: 'Avenue Mohammed VI, Hivernage',
        city: 'Marrakech',
        ice: '001984210000012',
        if: '32091845',
        rc: '45012 MARRAKECH',
        totalDue: 2620.00
      },
      {
        name: 'MOULINE FOURNISSEUR AGRO SARL',
        type: 'fournisseur',
        isCompany: true,
        email: 'contact@mouline-agro.ma',
        phone: '+212 522 30 19 80',
        address: 'Zone Industrielle Ain Sebaa, Allée des Usines',
        city: 'Casablanca',
        ice: '001764532000099',
        if: '29384756',
        rc: '59203 CASA',
        totalDue: 0.00
      },
      {
        name: 'CENTRALE LAITIÈRE & ALIMENTAIRE MAROC',
        type: 'fournisseur',
        isCompany: true,
        email: 'commandes@danonemaroc.com',
        phone: '+212 522 77 88 99',
        address: 'Sidi Bernoussi, Km 11 Route de Rabat',
        city: 'Casablanca',
        ice: '000129840000033',
        if: '10293847',
        rc: '12034 CASA',
        totalDue: 3400.00
      },
      {
        name: 'M. KARIM BENNANI',
        type: 'client',
        isCompany: false,
        email: 'k.bennani@gmail.com',
        phone: '+212 661 22 33 44',
        address: 'Résidence les Palmiers, Agdal',
        city: 'Rabat',
        ice: '',
        if: '',
        rc: '',
        totalDue: 0.00
      }
    ]);

    const clientCommune = contacts[0];
    const clientMaghreb = contacts[1];
    const clientHotel = contacts[2];
    const fournisseurMouline = contacts[3];
    const fournisseurCentrale = contacts[4];

    // 4. Invoices (Factures)
    const invoices = await Invoice.insertMany([
      {
        invoiceNumber: 'FACT/2026/00001',
        type: 'client',
        contact: clientCommune._id,
        contactName: clientCommune.name,
        date: new Date('2026-10-10'),
        dueDate: new Date('2026-11-10'),
        salesperson: 'Hamza Vendeur',
        items: [
          {
            product: products[0]._id,
            reference: products[0].reference,
            description: products[0].name,
            quantity: 20,
            unitPrice: 35.00,
            taxRate: 20,
            subtotal: 700.00,
            taxAmount: 140.00,
            total: 840.00
          },
          {
            product: products[6]._id,
            reference: products[6].reference,
            description: products[6].name,
            quantity: 60,
            unitPrice: 7.00,
            taxRate: 20,
            subtotal: 420.00,
            taxAmount: 84.00,
            total: 504.00
          }
        ],
        subtotal: 1120.00,
        taxAmount: 227.00,
        totalAmount: 1347.00,
        amountPaid: 1347.00,
        status: 'comptabilise',
        paymentStatus: 'paye',
        paymentMethod: 'Virement bancaire'
      },
      {
        invoiceNumber: 'FACT/2026/00002',
        type: 'client',
        contact: clientMaghreb._id,
        contactName: clientMaghreb.name,
        date: new Date('2026-10-12'),
        dueDate: new Date('2026-11-12'),
        salesperson: 'Fatima Zahra',
        items: [
          {
            product: products[2]._id,
            reference: products[2].reference,
            description: products[2].name,
            quantity: 40,
            unitPrice: 45.00,
            taxRate: 20,
            subtotal: 1800.00,
            taxAmount: 360.00,
            total: 2160.00
          },
          {
            product: products[7]._id,
            reference: products[7].reference,
            description: products[7].name,
            quantity: 60,
            unitPrice: 4.00,
            taxRate: 20,
            subtotal: 240.00,
            taxAmount: 48.00,
            total: 288.00
          }
        ],
        subtotal: 2040.00,
        taxAmount: 408.00,
        totalAmount: 2448.00,
        amountPaid: 2448.00,
        status: 'comptabilise',
        paymentStatus: 'paye',
        paymentMethod: 'Chèque'
      },
      {
        invoiceNumber: 'FACT/2026/00003',
        type: 'client',
        contact: clientCommune._id,
        contactName: clientCommune.name,
        date: new Date('2026-10-15'),
        dueDate: new Date('2026-11-15'),
        salesperson: 'Hamza Vendeur',
        items: [
          {
            product: products[1]._id,
            reference: products[1].reference,
            description: products[1].name,
            quantity: 30,
            unitPrice: 25.00,
            taxRate: 20,
            subtotal: 750.00,
            taxAmount: 140.00,
            total: 890.00
          }
        ],
        subtotal: 750.00,
        taxAmount: 140.00,
        totalAmount: 890.00,
        amountPaid: 0.00,
        status: 'comptabilise',
        paymentStatus: 'non_paye'
      },
      {
        invoiceNumber: 'FACT/2026/00004',
        type: 'client',
        contact: clientHotel._id,
        contactName: clientHotel.name,
        date: new Date('2026-10-16'),
        dueDate: new Date('2026-11-16'),
        salesperson: 'Administrateur',
        items: [
          {
            product: products[5]._id,
            reference: products[5].reference,
            description: products[5].name,
            quantity: 60,
            unitPrice: 65.00,
            taxRate: 20,
            subtotal: 3900.00,
            taxAmount: 780.00,
            total: 4680.00
          },
          {
            product: products[8]._id,
            reference: products[8].reference,
            description: products[8].name,
            quantity: 30,
            unitPrice: 15.00,
            taxRate: 20,
            subtotal: 450.00,
            taxAmount: 90.00,
            total: 540.00
          }
        ],
        subtotal: 4350.00,
        taxAmount: 770.00,
        totalAmount: 5120.00,
        amountPaid: 2500.00,
        status: 'comptabilise',
        paymentStatus: 'partiel'
      },
      {
        invoiceNumber: 'FAC-FOUR/2026/00001',
        type: 'fournisseur',
        contact: fournisseurCentrale._id,
        contactName: fournisseurCentrale.name,
        date: new Date('2026-10-14'),
        dueDate: new Date('2026-11-14'),
        salesperson: 'Acheteur Central',
        items: [
          {
            product: products[11]._id,
            reference: products[11].reference,
            description: 'Approvisionnement Viande Hachée Fraîche (40 Kg)',
            quantity: 40,
            unitPrice: 75.00,
            taxRate: 20,
            subtotal: 3000.00,
            taxAmount: 400.00,
            total: 3400.00
          }
        ],
        subtotal: 3000.00,
        taxAmount: 400.00,
        totalAmount: 3400.00,
        amountPaid: 0.00,
        status: 'comptabilise',
        paymentStatus: 'non_paye'
      }
    ]);

    // 5. Payments
    await Payment.insertMany([
      {
        paymentNumber: 'PAY/2026/00001',
        invoice: invoices[0]._id,
        contact: clientCommune._id,
        contactName: clientCommune.name,
        type: 'inbound',
        paymentMethod: 'Virement bancaire',
        amount: 1347.00,
        paymentDate: new Date('2026-10-11'),
        reference: 'VIR-BMCE-9921',
        journal: 'Banque BMCE'
      },
      {
        paymentNumber: 'PAY/2026/00002',
        invoice: invoices[1]._id,
        contact: clientMaghreb._id,
        contactName: clientMaghreb.name,
        type: 'inbound',
        paymentMethod: 'Chèque',
        amount: 2448.00,
        paymentDate: new Date('2026-10-13'),
        reference: 'CHQ-ATTIJARI-4410',
        journal: 'Banque Attijariwafa'
      },
      {
        paymentNumber: 'PAY/2026/00003',
        invoice: invoices[3]._id,
        contact: clientHotel._id,
        contactName: clientHotel.name,
        type: 'inbound',
        paymentMethod: 'Virement bancaire',
        amount: 2500.00,
        paymentDate: new Date('2026-10-17'),
        reference: 'VIR-BP-7701',
        journal: 'Banque Populaire'
      }
    ]);

    // 6. Stock Operations (Matching Odoo inventory operations in video)
    await StockOperation.insertMany([
      {
        reference: 'WH/IN/2026/00001',
        type: 'reception',
        partner: fournisseurMouline._id,
        partnerName: fournisseurMouline.name,
        sourceLocation: 'Fournisseurs',
        destinationLocation: 'WH/Stock',
        sourceDocument: 'BC/2026/012',
        date: new Date('2026-10-12'),
        status: 'fait',
        items: [
          { product: products[0]._id, productName: products[0].name, demandedQuantity: 50, doneQuantity: 50 },
          { product: products[6]._id, productName: products[6].name, demandedQuantity: 120, doneQuantity: 120 }
        ]
      },
      {
        reference: 'WH/IN/2026/00002',
        type: 'reception',
        partner: fournisseurCentrale._id,
        partnerName: fournisseurCentrale.name,
        sourceLocation: 'Fournisseurs',
        destinationLocation: 'WH/Stock',
        sourceDocument: 'BC/2026/014',
        date: new Date('2026-10-18'),
        status: 'pret',
        items: [
          { product: products[11]._id, productName: products[11].name, demandedQuantity: 30, doneQuantity: 0 },
          { product: products[10]._id, productName: products[10].name, demandedQuantity: 20, doneQuantity: 0 }
        ]
      },
      {
        reference: 'WH/OUT/2026/00001',
        type: 'livraison',
        partner: clientCommune._id,
        partnerName: clientCommune.name,
        sourceLocation: 'WH/Stock',
        destinationLocation: 'Clients',
        sourceDocument: 'FACT/2026/00001',
        date: new Date('2026-10-11'),
        status: 'fait',
        items: [
          { product: products[0]._id, productName: products[0].name, demandedQuantity: 20, doneQuantity: 20 },
          { product: products[6]._id, productName: products[6].name, demandedQuantity: 60, doneQuantity: 60 }
        ]
      },
      {
        reference: 'WH/OUT/2026/00002',
        type: 'livraison',
        partner: clientHotel._id,
        partnerName: clientHotel.name,
        sourceLocation: 'WH/Stock',
        destinationLocation: 'Clients',
        sourceDocument: 'FACT/2026/00004',
        date: new Date('2026-10-17'),
        status: 'pret',
        items: [
          { product: products[5]._id, productName: products[5].name, demandedQuantity: 60, doneQuantity: 0 }
        ]
      },
      {
        reference: 'WH/INT/2026/00001',
        type: 'transfert',
        partner: null,
        partnerName: 'Transfert Inter-Magasin',
        sourceLocation: 'WH/Stock Central',
        destinationLocation: 'Shop 1 / Caisse',
        sourceDocument: 'DEM-008',
        date: new Date('2026-10-15'),
        status: 'fait',
        items: [
          { product: products[7]._id, productName: products[7].name, demandedQuantity: 40, doneQuantity: 40 }
        ]
      }
    ]);

    // 7. Stock Movements (Historical Log)
    await StockMovement.insertMany([
      {
        product: products[0]._id,
        productName: products[0].name,
        operationType: 'reception',
        referenceDoc: 'WH/IN/2026/00001',
        quantityChanged: 50,
        previousStock: 15,
        newStock: 65,
        location: 'WH/Stock'
      },
      {
        product: products[0]._id,
        productName: products[0].name,
        operationType: 'livraison',
        referenceDoc: 'WH/OUT/2026/00001',
        quantityChanged: -20,
        previousStock: 65,
        newStock: 45,
        location: 'WH/Stock'
      },
      {
        product: products[6]._id,
        productName: products[6].name,
        operationType: 'reception',
        referenceDoc: 'WH/IN/2026/00001',
        quantityChanged: 120,
        previousStock: 60,
        newStock: 180,
        location: 'WH/Stock'
      },
      {
        product: products[6]._id,
        productName: products[6].name,
        operationType: 'livraison',
        referenceDoc: 'WH/OUT/2026/00001',
        quantityChanged: -60,
        previousStock: 180,
        newStock: 120,
        location: 'WH/Stock'
      }
    ]);

    // 8. POS Sessions (Point de Vente)
    const posSession = await PosSession.create({
      sessionNumber: 'POS/2026/001',
      name: 'Shop 1 - Caisse Principale',
      cashier: 'Mohamed Caisse',
      openingCash: 500.00,
      status: 'en_cours',
      totalSales: 412.40,
      ordersCount: 3
    });

    await PosSession.create({
      sessionNumber: 'POS/2026/002',
      name: 'Restaurant & Snack Caisse',
      cashier: 'Fatima Service',
      openingCash: 400.00,
      closingCash: 1250.00,
      totalSales: 850.00,
      ordersCount: 8,
      status: 'fermee',
      closingDate: new Date('2026-10-17T22:30:00')
    });

    // 9. Initial POS Orders (including one matching exactly the 134,40 DH ticket from the video!)
    await PosOrder.insertMany([
      {
        orderNumber: 'TICK-0001',
        posSession: posSession._id,
        clientName: 'Client Comptoir',
        date: new Date(),
        items: [
          {
            product: products[0]._id,
            productName: products[0].name,
            quantity: 2,
            unitPrice: 35.00,
            discount: 0,
            subtotal: 70.00
          },
          {
            product: products[2]._id,
            productName: products[2].name,
            quantity: 1,
            unitPrice: 45.00,
            discount: 0,
            subtotal: 45.00
          },
          {
            product: products[6]._id,
            productName: products[6].name,
            quantity: 2,
            unitPrice: 7.00,
            discount: 0,
            subtotal: 14.00
          },
          {
            product: products[7]._id,
            productName: products[7].name,
            quantity: 1,
            unitPrice: 4.00,
            discount: 0,
            subtotal: 4.00
          }
        ],
        subtotal: 133.00,
        taxAmount: 1.40,
        total: 134.40, // Directly matching the video's 134,40 DH ticket!
        amountReceived: 150.00,
        changeGiven: 15.60,
        paymentMethod: 'Espèces',
        cashier: 'Mohamed Caisse',
        status: 'paye'
      },
      {
        orderNumber: 'TICK-0002',
        posSession: posSession._id,
        clientName: 'M. KARIM BENNANI',
        date: new Date(),
        items: [
          {
            product: products[1]._id,
            productName: products[1].name,
            quantity: 3,
            unitPrice: 25.00,
            discount: 0,
            subtotal: 75.00
          },
          {
            product: products[4]._id,
            productName: products[4].name,
            quantity: 2,
            unitPrice: 12.00,
            discount: 0,
            subtotal: 24.00
          },
          {
            product: products[9]._id,
            productName: products[9].name,
            quantity: 2,
            unitPrice: 18.00,
            discount: 0,
            subtotal: 36.00
          }
        ],
        subtotal: 135.00,
        taxAmount: 0,
        total: 135.00,
        amountReceived: 200.00,
        changeGiven: 65.00,
        paymentMethod: 'Espèces',
        cashier: 'Mohamed Caisse',
        status: 'paye'
      }
    ]);

    console.log('Données de démonstration marocaines injectées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  }
};

seedDatabase();
