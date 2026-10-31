# ADS COLLECTIONS 🥻 — Saree Catalogue

A responsive boutique catalogue with exactly two product photos per saree, INR pricing, direct WhatsApp ordering, and an owner-only product dashboard backed by Supabase.

## Important: preview vs. live website

- Without Supabase environment variables, the site opens in **preview mode** with sample catalogue cards. Sample items are not real inventory.
- To make product uploads, owner login, cloud storage, and the live catalogue work, connect a Supabase project by following the steps below.
- This project is not deployed to a public web address yet. You will need to deploy it to a hosting provider after setup.

## 1. Create the cloud database

1. Create a project at [Supabase](https://supabase.com/).
2. In **Project Settings → API**, copy the Project URL and the publishable key (or legacy anon key).
3. In **SQL Editor**, open `supabase/setup.sql` from this project and paste it into the editor.
4. Before running the SQL, replace every `OWNER_AUTH_USER_UUID` with the UUID of your owner user. First create the owner user in **Authentication → Users → Add user**, then copy its UUID. Do not enable public sign-ups.
5. Run the SQL. This creates the products table, public read policies, owner-only write policies, and the public photo bucket with owner-only upload permissions.

The SQL file contains the exact policy configuration. Never use a Supabase `service_role` or secret key in the browser app.

## 2. Configure and run

Install Node.js 20+ and run from this folder:

```bash
npm install
cp .env.example .env
```

Edit `.env` and set:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Then run:

```bash
npm run dev
```

Open the local address printed by Vite. The owner uses the **Owner login** button on the website and signs in with the Supabase user email/password. Customers only see the catalogue; Supabase Row Level Security prevents customer sessions from adding, editing, or deleting products.

## 3. Deploy the public website

Deploy this Vite project to a static host such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Set the same two `VITE_` environment variables in the host's project settings, then trigger a production build/deploy. Connect a custom domain if desired.

## Product management

- Add a saree with its name, price, and two photos.
- Edit name/price and replace either or both photos.
- Delete sold-out products.
- Catalogue query loads up to 600 products from Supabase.
- Images must be under 10 MB and use a supported image format.
- Product cards let customers switch between photo 1 and photo 2.
- BUY NOW opens WhatsApp `+91 8999795326` with the product name, price, and product code prefilled.

## Security notes

- The browser contains only the Supabase publishable/anon key. This key is designed to be public; RLS policies are what protect the database.
- Never add a Supabase secret/service-role key to `.env` variables prefixed with `VITE_`, commit it to source control, or share it.
- Keep public sign-ups disabled and create the owner account manually.
- The owner UUID in the SQL policies must match the account that will manage the site. If you change owner accounts, update policies accordingly.
- Public photos are intentionally readable by anyone because the catalogue is public. Only the owner can upload or delete photos.
- This starter uploads replacement images as new files; the previous image file may remain in storage. Delete unused old files periodically from Supabase Storage if needed.

## Brand details

- Website name: ADS COLLECTIONS 🥻
- WhatsApp ordering number: `+91 8999795326`
- Theme: premium pink, white, and rose gold
