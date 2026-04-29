#!/bin/bash

# Script para limpar dados de teste do MongoDB
# Uso: ./scripts/clean-test-data.sh

echo "Conectando ao MongoDB e limpando dados de teste..."

npx -y ts-node --esm --skip-project <<'EOF'
import clientPromise from "/home/mrpunkdasilva/WebstormProjects/minhacasa/src/app/infra/lib/mongodb.ts";

const cleanTestData = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("minhacasa");

    console.log("Limpando dados de teste...\n");

    // Delete test invoices
    const invoicesResult = await db.collection("invoices").deleteMany({
      $or: [
        { name: "asdasd" },
        { name: { $regex: "^test", $options: "i" } },
      ],
    });

    if (invoicesResult.deletedCount > 0) {
      console.log(`✓ ${invoicesResult.deletedCount} faturas de teste removidas`);
    }

    console.log("\n✓ Limpeza concluída!");
    process.exit(0);
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
};

cleanTestData();
EOF

