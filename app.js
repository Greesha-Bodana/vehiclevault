const express = require("express")
const cors = require("cors")
const path = require("path")
const app = express()
require("dotenv").config({ override: true })

if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is missing in .env. Login will not work without it.")
}

app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

const DBConnection = require("./src/utils/DBConnection")
const seedDefaultUsers = require("./src/utils/seedUsers")
const Car = require("./src/models/CarModel")
const Accessory = require("./src/models/AccessoryModel")
const User = require("./src/models/UserModel")

DBConnection().then((mongooseInstance) => {
    if (mongooseInstance) {
        seedDefaultUsers().catch((err) => {
            console.error("Failed to seed default users:", err.message)
        })
    }
})

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

const formatMoney = (value) => {
    const amount = Number(value || 0)
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(amount)
}

const normalizeImage = (image) => {
    if (typeof image !== "string" || !image) {
        return ""
    }

    if (image.startsWith("/uploads/")) {
        return encodeURI(image)
    }

    return image
}

const fallbackHeroImage = "/uploads/1779712825392-215902955-Mercedes_GLC_300.jpg"

const getHomeData = async () => {
    const [carsListed, availableCars, accessories, members, featuredCars] = await Promise.all([
        Car.countDocuments(),
        Car.countDocuments({ isAvailable: true }),
        Accessory.countDocuments(),
        User.countDocuments(),
        Car.find()
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(3)
    ])

    return {
        stats: {
            carsListed,
            availableCars,
            accessories,
            members
        },
        featuredCars: featuredCars.map((car) => ({
            ...car.toObject(),
            image: normalizeImage(car.image)
        }))
    }
}

const buildHomePage = ({ stats, featuredCars }) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="VehicleVault backend homepage." />
  <title>VehicleVault | Home</title>
  <style>
    :root {
      --bg: #07111d;
      --panel: rgba(10, 17, 30, 0.84);
      --panel-2: rgba(255, 255, 255, 0.04);
      --line: rgba(255, 255, 255, 0.08);
      --text: #eef4ff;
      --muted: #a9b5ca;
      --accent: #ff8a3d;
      --accent-2: #30d5c8;
      --accent-3: #59a7ff;
      --shadow: 0 30px 90px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      color: var(--text);
      background:
        radial-gradient(circle at 15% 20%, rgba(48, 213, 200, 0.16), transparent 22%),
        radial-gradient(circle at 80% 16%, rgba(255, 138, 61, 0.16), transparent 20%),
        linear-gradient(145deg, #050b14 0%, #08111d 48%, #08172a 100%);
      font-family: "Segoe UI", "Trebuchet MS", system-ui, sans-serif;
      overflow: hidden;
    }
    a { color: inherit; text-decoration: none; }
    .shell {
      width: min(1200px, calc(100% - 28px));
      height: 100vh;
      margin: 0 auto;
      padding: 18px 0 18px;
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 14px;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    .brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .brand strong { font-size: 1.04rem; letter-spacing: 0.12em; text-transform: uppercase; }
    .brand span { color: var(--muted); font-size: 0.9rem; }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: flex-end;
    }
    .pill {
      padding: 9px 13px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.03);
      color: var(--muted);
      font-size: 0.9rem;
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
      gap: 18px;
      align-items: stretch;
      min-height: 0;
    }
    .copy, .panel {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), var(--panel);
      border-radius: 30px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }
    .copy {
      padding: 34px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
      overflow: hidden;
      position: relative;
    }
    .copy::before {
      content: "";
      position: absolute;
      inset: auto -80px -80px auto;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 138, 61, 0.22), transparent 65%);
      pointer-events: none;
    }
    .eyebrow {
      margin: 0;
      color: var(--accent-2);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 0.76rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.8rem, 5vw, 5rem);
      line-height: 0.92;
      letter-spacing: -0.07em;
      max-width: 9.2ch;
    }
    .subtitle {
      max-width: 56ch;
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.7;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 2px;
    }
    .button {
      min-height: 46px;
      padding: 0 17px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-weight: 700;
      transition: transform 180ms ease, box-shadow 180ms ease;
    }
    .button:hover { transform: translateY(-1px); }
    .primary {
      color: #11151d;
      background: linear-gradient(135deg, var(--accent) 0%, #ffb96f 100%);
      box-shadow: 0 16px 34px rgba(255, 138, 61, 0.25);
    }
    .secondary {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.035);
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      max-width: 640px;
    }
    .meta-card {
      padding: 15px;
      border-radius: 22px;
      background: var(--panel-2);
      border: 1px solid rgba(255,255,255,0.07);
    }
    .meta-value {
      font-size: 1.65rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      margin-bottom: 8px;
    }
    .meta-label { color: var(--muted); font-size: 0.92rem; }
    .feature-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }
    .feature {
      padding: 9px 12px;
      border-radius: 999px;
      background: rgba(48, 213, 200, 0.08);
      border: 1px solid rgba(48, 213, 200, 0.16);
      color: #dbfffb;
      font-size: 0.88rem;
    }
    .panel {
      padding: 20px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 14px;
      min-height: 0;
    }
    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      color: var(--muted);
      font-size: 0.92rem;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .status::before {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #5cffad;
      box-shadow: 0 0 0 8px rgba(92, 255, 173, 0.12);
    }
    .hero-image {
      position: relative;
      overflow: hidden;
      border-radius: 26px;
      aspect-ratio: 16 / 11;
      background:
        linear-gradient(180deg, rgba(7, 17, 29, 0.08), rgba(7, 17, 29, 0.62)),
        linear-gradient(135deg, rgba(255, 138, 61, 0.14), rgba(48, 213, 200, 0.12));
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 260ms ease;
    }
    .hero-image:hover img {
      transform: scale(1.03);
    }
    .hero-image::after {
      content: "Featured inventory";
      position: absolute;
      left: 16px;
      bottom: 16px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(7, 17, 29, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text);
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      backdrop-filter: blur(10px);
    }
    .feature-image {
      position: relative;
      overflow: hidden;
      border-radius: 28px;
      min-height: 0;
      background:
        linear-gradient(180deg, rgba(7, 17, 29, 0.06), rgba(7, 17, 29, 0.58)),
        linear-gradient(135deg, rgba(255, 138, 61, 0.16), rgba(48, 213, 200, 0.12));
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .feature-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 260ms ease;
    }
    .feature-image:hover img {
      transform: scale(1.03);
    }
    .feature-image::after {
      content: "Featured vehicle";
      position: absolute;
      left: 16px;
      bottom: 16px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(7, 17, 29, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text);
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      backdrop-filter: blur(10px);
    }
    .hero-info {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .info-card {
      padding: 14px;
      border-radius: 22px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .info-kicker {
      color: var(--muted);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .info-title {
      margin: 0 0 6px;
      font-size: 1.02rem;
      letter-spacing: -0.02em;
    }
    .info-sub {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    @media (max-width: 1080px) {
      body { overflow: auto; }
      .shell { height: auto; min-height: 100vh; }
      .hero { grid-template-columns: 1fr; }
    }
    @media (max-width: 820px) {
      .topbar { flex-direction: column; align-items: flex-start; }
      .pill-row { justify-content: flex-start; }
      .meta-grid, .hero-info { grid-template-columns: 1fr 1fr; }
      .copy, .panel { padding: 22px; }
    }
    @media (max-width: 560px) {
      .shell { width: min(100% - 20px, 1240px); padding-top: 12px; }
      .meta-grid, .hero-info { grid-template-columns: 1fr; }
      h1 { max-width: 12ch; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <strong>VehicleVault</strong>
        <span>Backend-first car marketplace</span>
      </div>
      <div class="pill-row">
        <span class="pill">Cars</span>
        <span class="pill">Accessories</span>
        <span class="pill">Comparisons</span>
        <span class="pill">Wishlist</span>
        <span class="pill">Payments</span>
      </div>
    </header>

    <main class="hero">
      <section class="copy">
        <p class="eyebrow">Car marketplace backend</p>
        <h1>Vehicle sales, comparison, and inventory in one place.</h1>
        <p class="subtitle">
          VehicleVault keeps your car catalog, accessory catalog, comparisons, notifications, wishlist, and payments organized in one clean system.
        </p>
        <div class="actions">
          <a class="button primary" href="/car">Browse cars</a>
          <a class="button secondary" href="/api/home">View API snapshot</a>
        </div>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-value">${escapeHtml(stats.carsListed)}</div>
            <div class="meta-label">Cars listed</div>
          </div>
          <div class="meta-card">
            <div class="meta-value">${escapeHtml(stats.availableCars)}</div>
            <div class="meta-label">Available now</div>
          </div>
          <div class="meta-card">
            <div class="meta-value">${escapeHtml(stats.accessories)}</div>
            <div class="meta-label">Accessories</div>
          </div>
          <div class="meta-card">
            <div class="meta-value">${escapeHtml(stats.members)}</div>
            <div class="meta-label">Members</div>
          </div>
        </div>
        <div class="feature-row">
          <span class="feature">Protected admin routes</span>
          <span class="feature">Cloudinary upload support</span>
          <span class="feature">Razorpay payments</span>
        </div>
      </section>

      <aside class="panel">
        <div class="panel-head">
          <span class="status">Featured vehicle</span>
          <span>${escapeHtml(featuredCars.length)} live listings</span>
        </div>
        <div class="feature-image">
          <img
            src="${escapeHtml(featuredCars[0]?.image || fallbackHeroImage)}"
            alt="VehicleVault featured car"
          />
        </div>
        <div class="hero-info">
          <div class="info-card">
            <div class="info-kicker">Latest car</div>
            <div class="info-title">${escapeHtml(featuredCars[0]?.name || "Premium listing")}</div>
            <div class="info-sub">${escapeHtml(featuredCars[0]?.brand || "VehicleVault")} ${escapeHtml(featuredCars[0]?.model || "inventory")}</div>
          </div>
          <div class="info-card">
            <div class="info-kicker">Price</div>
            <div class="info-title">${escapeHtml(formatMoney(featuredCars[0]?.price || 0))}</div>
            <div class="info-sub">${escapeHtml(featuredCars[0]?.isAvailable ? "Ready to browse" : "Currently unavailable")}</div>
          </div>
          <div class="info-card">
            <div class="info-kicker">Year</div>
            <div class="info-title">${escapeHtml(featuredCars[0]?.year || "2024")}</div>
            <div class="info-sub">Built for comparison, accessories, and wishlist actions.</div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</body>
</html>
`

app.get("/", async (req, res) => {
    try {
        const homeData = await getHomeData()
        res.status(200).send(buildHomePage(homeData))
    } catch (error) {
        res.status(200).send(
            buildHomePage({
                stats: {
                    carsListed: 0,
                    availableCars: 0,
                    accessories: 0,
                    members: 0
                },
                featuredCars: []
            })
        )
    }
})

app.get("/api/home", async (req, res) => {
    try {
        res.status(200).json({
            message: "Home data fetched successfully",
            ...(await getHomeData())
        })
    } catch (error) {
        res.status(200).json({
            message: "Home data loaded with fallback values",
            stats: {
                carsListed: 0,
                availableCars: 0,
                accessories: 0,
                members: 0
            },
            featuredCars: [],
            warning: error.message
        })
    }
})

const userRoutes = require("./src/routes/UserRoutes")
app.use("/user", userRoutes)

const carRoutes = require("./src/routes/CarRoutes")
app.use("/car",carRoutes)

const comparisonRoutes =require("./src/routes/ComparisonRoutes")
app.use("/comparison",comparisonRoutes)

const accessoryRoutes= require("./src/routes/AccessoryRoutes")
app.use("/accessory",accessoryRoutes)

const notificationRoutes = require("./src/routes/NotificationRoutes")
app.use("/notification", notificationRoutes)

const wishlistRoutes = require("./src/routes/WishlistRoutes");
app.use("/wishlist", wishlistRoutes)

const paymentRoutes = require("./src/routes/PaymentRoutes")
app.use("/payment", paymentRoutes)

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})
