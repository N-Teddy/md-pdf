# Règles Métier : Actions de Rapports par Type de Convocation

Ce document clarifie les scénarios fonctionnels et définit précisément quelles actions de rapports sont autorisées selon le type et l'action de la convocation active.

## 1. Définitions des Éléments

### Types de Convocation (Motif initial)

- **NON_CONFORME** : Construction avec permis mais non conforme aux plans.
- **DEFAUT_DE_PERMIS** : Construction sans permis de bâtir.
- **ZONE_NON_AUTORISEE** : Construction dans une zone interdite.

### Actions de Convocation (Mesures prises)

- **ARRET_TRAVAUX** : Ordre d'arrêt immédiat du chantier.
- **CHANTIER_SCELLE** : Apposition de scellés sur le chantier.
- **SAISIE** : Saisie de matériel de construction.
- **A_DEMOLIR** : Ordre de démolition.
- **BRIS_SCELLE** : Constat de violation de scellés.
- **LEVE_DE_SCELLE** : Action de retirer les scellés (après régularisation).

---

## 2. Matrice de Compatibilité des Rapports

Le tableau ci-dessous définit quel rapport peut être produit en fonction de l'**Action** actuelle de la convocation.

| Action Actuelle     |  Rapport de Conformité  | Rapport de Levée de scellé | Rapport de Démolition | Rapport de Restitution |
| :------------------ | :---------------------: | :------------------------: | :-------------------: | :--------------------: |
| **ARRET_TRAVAUX**   |       ✅ Autorisé       |        ❌ Interdit         |      ❌ Interdit      |      ❌ Interdit       |
| **CHANTIER_SCELLE** | ✅ Autorisé (Préalable) |    ✅ Autorisé (Final)     |      ❌ Interdit      |      ❌ Interdit       |
| **SAISIE**          |       ❌ Interdit       |        ❌ Interdit         |      ❌ Interdit      |      ✅ Autorisé       |
| **A_DEMOLIR**       |       ❌ Interdit       |        ❌ Interdit         |      ✅ Autorisé      |      ❌ Interdit       |
| **BRIS_SCELLE**     |       ❌ Interdit       | ✅ Autorisé (Re-scellage)  |      ❌ Interdit      |      ❌ Interdit       |
| **LEVE_DE_SCELLE**  |       ✅ Autorisé       |        ❌ Interdit         |      ❌ Interdit      |      ❌ Interdit       |

---

## 3. Détails des Scénarios Fonctionnels

### A. Scénario "Arrêt des travaux"

Lorsqu'un chantier est arrêté pour non-conformité ou défaut de permis :

- **Action Autorisée** : **Rapport de Conformité**. L'agent doit pouvoir attester que le propriétaire a régularisé sa situation (obtention du permis ou mise en conformité technique).
- **Actions Interdites** : Levée de scellé (pas de scellés posés), Démolition (sauf si l'action change en `A_DEMOLIR`), Restitution (pas de saisie).
- **Statut requis** : La propriété doit être au statut `SUMMONED`.

### B. Scénario "Chantier Scellé"

Lorsqu'un chantier est sous scellés :

- **Action Autorisée** : **Rapport de Levée de scellé**. Possible uniquement si l'amende associée est **PAYÉE** ou **RÉGULARISÉE**.
- **Action Autorisée** : **Rapport de Conformité**. Souvent nécessaire avant de procéder à la levée des scellés pour valider les corrections techniques.

### C. Scénario "Saisie de matériel"

- **Action Autorisée** : **Rapport de Restitution de matériel**. Utilisé pour documenter le retour des équipements saisis après paiement des amendes.

### D. Scénario "Démolition"

- **Action Autorisée** : **Rapport de Démolition**. Utilisé pour confirmer que la démolition a bien eu lieu. Ce rapport change l'état d'avancement de la propriété en `DEMOLISHED_HOUSE`.

---

## 4. Règles de Validation Système (Logique à aligner)

1. **Vérification du Rôle** :
   - Les rapports de **Conformité** sont réservés aux agents du **GUCE** (Agent Conformité).
   - Les rapports de **Démolition, Levée de scellé, Restitution** sont réservés aux agents de la **SDCC** (Agent Contrôle / Assermenté).

2. **Vérification de l'Action** :
   - Le système doit bloquer la création d'un rapport si l'action de la convocation ne correspond pas à la matrice ci-dessus.
   - **Message d'erreur suggéré** : _"Action non autorisée : Le rapport de [Type] ne peut pas être créé pour une convocation en état [Action]."_

3. **Vérification Financière** :
   - Pour la **Levée de scellé** et la **Restitution**, le système doit vérifier que `amende.status` est `PAID` ou `PAID_AND_REGULARISED`.
   - **Message d'erreur suggéré** : _"Action bloquée : L'amende associée doit être payée ou régularisée avant de procéder à cette action."_

4. **Vérification du Statut Propriété** :
   - Toutes ces actions nécessitent que la propriété soit au statut `SUMMONED`.
