# 📦 Odoo Service Maroc - Système ERP de Gestion de Stock, Facturation & Caisse POS (MERN Stack)



Conçu avec la **stack MERN** (MongoDB, Express, React, Node.js) et **Tailwind CSS**, il respecte fidèlement la charte graphique violette Odoo (`#714B67`), l'ergonomie, la devise marocaine (**MAD / DH**), et la synchronisation automatique en temps réel des stocks.

---

## 🚀 Fonctionnalités Clés Réalisées (Conformes à la Démo)

### 1. 🧾 Facturation & Comptabilité (`/facturation`)
- **Factures Clients & Fournisseurs** :
  - Numérotation automatique normalisée (`FACT/2026/00001`, `FAC-FOUR/...`).
  - Dates d'émission et d'échéance (+30 jours par défaut).
  - Détail par article avec calcul automatique du sous-total **HT**, de la **TVA (20%)** et du montant **TTC (DH)**.
  - Statuts conformes à Odoo : `Brouillon`, `Comptabilisé`, `Payé`, `Partiel`, `Non payé`.
- **Validation & Comptabilisation** : validation en 1 clic mettant à jour les créances clients / dettes fournisseurs.
- **Enregistrement des Paiements** : prise en charge des modes : *Espèces*, *Virement bancaire*, *Chèque*, *Carte bancaire*.
- **Impression de Facture** : fiche imprimable format A4 avec en-tête d'entreprise, ICE, IF et tableau récapitulatif.

### 2. 📦 Inventaire & Synchronisation Automatique du Stock (`/inventaire`)
- **Tableau de Bord des Opérations (Kanban Odoo)** :
  - **Réceptions Fournisseurs (WH/IN)** : suivi des entrées de marchandises en attente et terminées.
  - **Bons de Livraison Clients (WH/OUT)** : préparation et validation des expéditions clients.
  - **Transferts Internes (WH/INT)** : mouvements entre l'entrepôt central et la caisse/boutique.
- **Synchronisation en Temps Réel** :
  - La validation d'une réception **incrémente** automatiquement la quantité en stock.
  - La validation d'une livraison ou d'une vente en caisse POS **décrémente** immédiatement le stock.
- **Catalogue Articles / Produits** :
  - Vue double : **Grille visuelle** (cartes avec photos, prix en DH, stock disponible et badges d'alerte) et **Vue Tableau**.
  - Gestion des alertes de stock bas (articles sous le seuil d'alerte).
- **Audit des Mouvements de Stock** :
  - Historique complet traçant chaque mouvement : date, référence document, variation (+ / -), stock antérieur et nouveau stock.

### 3. 🛒 Terminal Point de Vente / Caisse Tactile (`/pos/caisse`)
- **Interface Caisse Tactile Interactive** (reproduisant exactement l'écran 00:23 - 00:30 de la démo) :
  - Barre de filtres par catégories d'articles (*Restauration & Fast-Food*, *Boissons & Cafés*, *Épicerie*, *Boulangerie*).
  - Barre de recherche rapide et saisie code-barres.
  - Grille de produits avec photos et prix en DH : clic pour ajouter au panier ou augmenter la quantité.
  - Panneau panier : gestion des quantités (+ / -), sélection du client (*Client Comptoir* ou client enregistré).
  - Calcul du total net à payer en DH.
- **Écran de Règlement (Paiement)** :
  - Sélection du mode : *Espèces*, *Carte bancaire (TPE)*, *Virement / Chèque*, *Compte client*.
  - Pavé numérique tactile interactif (1 à 9, 0, C, retour).
  - **Boutons de billets marocains rapides** : `+10 DH`, `+20 DH`, `+50 DH`, `+100 DH`, `+200 DH` et montant exact.
  - Calcul instantané de la **Monnaie à rendre** en DH.
- **Ticket de Caisse Thermique Imprimable** :
  - Ticket conforme au standard marocain (nom d'établissement, ICE, IF, date, heure, ticket #, détail des articles, TVA, total en DH, monnaie rendue, "Merci de votre visite").
  - Bouton direct `Imprimer le ticket` (compatible imprimantes thermiques 80mm ESC/POS via `window.print()`).

### 4. 👥 Répertoire Contacts Marocains (`/contacts`)
- Gestion des **Clients** et **Fournisseurs**.
- Champs légaux marocains : **ICE** (Identifiant Commun de l'Entreprise à 15 chiffres), **IF**, **RC**, Ville (*Casablanca, Rabat, Marrakech, Tanger*), Téléphone et Email.
- Suivi du solde dû par contact.

---

## 🛠️ Stack Technique

- **Frontend** : React 18 / 19, Vite, Tailwind CSS, Lucide React, React Router v7, Axios.
- **Backend** : Node.js, Express, Mongoose (MongoDB), CORS, Morgan.
- **Base de données** : MongoDB local (`mongodb://localhost:27017/gestion_stock_db`).
- **Devise** : Dirham Marocain (MAD / DH).

---

## 🏁 Démarrage Rapide

### 1. Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) en cours d'exécution sur le port par défaut 27017.

### 2. Initialisation des données de démo marocaines
Pour insérer les articles (Burgers, Pizzas, Boissons, Saucisses, etc.), factures (Commune de Rabat, Société Maghreb Tech...), réceptions et sessions de caisse identiques à la vidéo :

```bash
cd backend
npm run seed
```
*(Ou double-cliquez sur `seed_data.bat` sous Windows)*

### 3. Démarrage des serveurs

Vous pouvez soit :
- **Option 1 (1-Clic)** : Double-cliquer sur le fichier `start_servers.bat` à la racine du projet.
- **Option 2 (Ligne de commande)** :
  - **Terminal 1 (Backend)** :
    ```bash
    cd backend
    npm start
    ```
    *Le serveur démarre sur le port 5000 (`http://localhost:5000`).*
  - **Terminal 2 (Frontend)** :
    ```bash
    cd frontend
    npm run dev
    ```
    *L'interface s'ouvre sur `http://localhost:3000`.*




