const bcrypt = require("bcryptjs");

async function main() {
  const password = process.argv[2];

  if (!password || password.length < 8 || password.length > 72) {
    console.error("Provide a password between 8 and 72 characters.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
}

main().catch((error) => {
  console.error("Could not generate password hash:", error.message);
  process.exit(1);
});

/* password of admin login: "YourStrongPassword123!"*/