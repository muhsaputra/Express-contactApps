const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3000;

// EJS
app.set("view engine", "ejs");
app.use(expressLayouts); // Third-Party Middleware
app.use(express.static("public")); // Built-in middleware
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  const pelajar = [
    {
      nama: "saputra",
      email: "muhsaputrabiz@gmail.com",
    },
    {
      nama: "jikra",
      email: "jikra@gmail.com",
    },
    {
      nama: "erina",
      email: "erina@gmail.com",
    },
  ];

  res.render("index", {
    nama: "jikra",
    layout: "layouts/main",
    title: "Halaman Home",
    pelajar: pelajar,
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main",
    title: "Halaman About",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();

  res.render("contact", {
    layout: "layouts/main",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah data
app.get("/contact/add/", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data",
    layout: "layouts/main",
  });
});

// Proses data contact
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplicate = checkDuplicate(value);
      if (duplicate) {
        throw new Error("Nama Contact Sudah Terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHp", "No Hp tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("add-contact", {
        title: "Form Tambah Data",
        layout: "layouts/main",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // Kirimkan flash
      req.flash("msg", "Data Berhasil Ditambahkan!");
      res.redirect("/contact");
    }
  }
);

// Proses delete contact
app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  // jika kontak tidak ada
  if (!contact) {
    res.status(404);
  } else {
    deleteContact(req.params.nama);
    req.flash("msg", "Data Berhasil Dihapus!");
    res.redirect("/contact");
  }
});

// form ubah data contact
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("edit-contact", {
    title: "Form Ubah Data",
    layout: "layouts/main",
    contact,
  });
});

// Proses ubah data
app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplicate = checkDuplicate(value);
      if (value !== req.body.oldNama && duplicate) {
        throw new Error("Nama Contact Sudah Terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("noHp", "No Hp tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render("edit-contact", {
        title: "Form Ubah Data",
        layout: "layouts/main",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContacts(req.body);
      // Kirimkan flash
      req.flash("msg", "Data Berhasil Diubah!");
      res.redirect("/contact");
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("detail", {
    layout: "layouts/main",
    title: "Halaman Detail",
    contact,
  });
});

app.use("/", (req, res) => {
  res.status(404);
  res.send("<h1>Error 404</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
