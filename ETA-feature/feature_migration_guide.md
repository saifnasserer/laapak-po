# Invoice Fetching Feature Migration Guide

This guide details the files and steps required to migrate the ETA Invoice Fetching feature to another system.

## 1. Files to Copy

### Backend (Node.js)
| File | Path | Description |
|------|------|-------------|
| **Core Script** | [fetch_full_invoices.js](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/fetch_full_invoices.js) | The main standalone script that authenticates with ETA, handles 30-day pagination limits, and saves full JSON invoices locally. |
| **API Logic** | [server/index.js](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/server/index.js) | You need to extract the specific routes and helper functions (see below). |

### Frontend (React)
| File | Path | Description |
|------|------|-------------|
| **Component** | [client/src/components/FetchInvoices.jsx](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/client/src/components/FetchInvoices.jsx) | The UI component for triggering fetches by Month or Internal ID. |
| **Translations** | [client/src/translations.js](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/client/src/translations.js) | Dictionary file containing English/Arabic text for the UI. |

---

## 2. Dependencies

Ensure your new system has these packages installed:

**Backend ([package.json](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/package.json)):**
```json
{
  "dependencies": {
    "axios": "^1.x.x",
    "dotenv": "^16.x.x"
  }
}
```

**Frontend:**
- `lucide-react` (For icons)

---

## 3. Environment Variables (.env)

You must configure these variables in your new system's [.env](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/.env) file. Get these values from your ETA ERP Registration.

```env
ETA_AUTH_URL=https://id.eta.gov.eg/connect/token
ETA_API_URL=https://api.invoicing.eta.gov.eg/api/v1
ETA_CLIENT_ID=your_client_id_here
ETA_CLIENT_SECRET=your_client_secret_here
```
*(Use `https://id.preprod.eta.gov.eg` and `https://api.preprod.invoicing.eta.gov.eg` for testing)*

---

## 4. Logical Summary (How it works)

1.  **Authentication**:
    - The system sends a POST request to `ETA_AUTH_URL` with `client_id` and `client_secret`.
    - Returns a Bearer Access Token (valid for ~1 hour).

2.  **Fetching Documents (Summaries)**:
    - The script calls the ETA Search API (`/documents/search`).
    - **Constraint**: ETA allows searching only 31 days at a time. The script automatically loops through months if a longer range is requested.
    - It handles pagination using `continuationToken` provided by ETA.

3.  **Fetching Full Details**:
    - For every document found, the script calls the Raw API (`/documents/{uuid}/raw`).
    - This retrieves the full signed JSON document (including line items, taxes, and signatures).

4.  **Storage**:
    - Files are saved to a local folder named [invoices_full/](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/invoices_full).
    - **Naming Convention**:
        - Invoices: `[InternalID].json`
        - Credit Notes: `credit_[InternalID].json`
        - Debit Notes: `debit_[InternalID].json`

---

## 5. Code Fragments to Extract from [server/index.js](file:///media/saif/brain/Projects/Laapak-Softwares/invoicing-API/server/index.js)

If you are building an Express API, extract these specific parts into your new server file:

### Helper Functions
```javascript
function getDocumentType(fullDoc) {
    try {
        const doc = JSON.parse(fullDoc.document);
        return (doc.documentType || fullDoc.typeName || 'i').toLowerCase();
    } catch {
        return (fullDoc.typeName || 'i').toLowerCase();
    }
}

function generateFilename(internalId, documentType) {
    const type = documentType.toLowerCase();
    if (type === 'c') return `credit_${internalId}.json`;
    else if (type === 'd') return `debit_${internalId}.json`;
    else return `${internalId}.json`;
}
```

### Route Handler (`/api/fetch-invoices`)
Copy the `app.post('/api/fetch-invoices', async (req, res) => { ... })` block.
This route bridges the frontend request to the ETA API logic.
