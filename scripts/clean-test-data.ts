import clientPromise from "@/app/infra/lib/mongodb";

const cleanTestData = async () => {
  const client = await clientPromise;
  const db = client.db("minhacasa");

  try {
    console.log("Limpando dados de teste do banco de dados...\n");

    // Delete test/strange invoices
    const invoicesResult = await db.collection("invoices").deleteMany({
      $or: [
        { name: "asdasd" },
        { name: { $regex: "^test", $options: "i" } },
        { description: { $regex: "^test", $options: "i" } },
      ],
    });

    if (invoicesResult.deletedCount > 0) {
      console.log(`✓ ${invoicesResult.deletedCount} faturas de teste removidas`);
    }

    // Delete test markets
    const marketsResult = await db.collection("markets").deleteMany({
      $or: [
        { name: { $regex: "^test", $options: "i" } },
        { name: "asdasd" },
      ],
    });

    if (marketsResult.deletedCount > 0) {
      console.log(`✓ ${marketsResult.deletedCount} itens de mercado de teste removidos`);
    }

    // Delete test wishlist items
    const wishlistResult = await db.collection("wishlist_items").deleteMany({
      $or: [
        { name: { $regex: "^test", $options: "i" } },
        { name: "asdasd" },
      ],
    });

    if (wishlistResult.deletedCount > 0) {
      console.log(`✓ ${wishlistResult.deletedCount} itens de wishlist de teste removidos`);
    }

    console.log("\n✓ Limpeza concluída!");
  } catch (error) {
    console.error("Erro ao limpar dados de teste:", error);
    process.exit(1);
  }

  process.exit(0);
};

cleanTestData();

