import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { connectDatabase } from "../src/config/database";
import { Product } from "../src/models/Product.model";
import { Category } from "../src/models/Category.model";
import { ProductVariantInput } from "../src/types/types";
import { normalizeVariants } from "../src/utils/product.utils";

// Product categories and their variants
const productCategories = [
  {
    name: "Electronics",
    description: "Electronic gadgets and devices",
    subcategories: ["Phones", "Laptops", "Tablets", "Headphones", "Cameras"],
    brands: ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo"],
    sizes: ["256GB", "512GB", "1TB", "128GB"],
    colors: ["Black", "White", "Silver", "Gold", "Blue", "Red"],
  },
  {
    name: "Clothing",
    description: "Apparel for men, women, and children",
    subcategories: ["T-Shirts", "Jeans", "Dresses", "Shoes", "Jackets"],
    brands: ["Nike", "Adidas", "Zara", "H&M", "Levi's", "Puma"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy", "Gray", "Red", "Blue", "Green"],
  },
  {
    name: "Home & Garden",
    description: "Products for home improvement and outdoor living",
    subcategories: ["Furniture", "Kitchen", "Decor", "Tools", "Garden"],
    brands: ["IKEA", "Home Depot", "Target", "Wayfair", "Amazon Basics"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    colors: ["Brown", "Black", "White", "Gray", "Beige"],
  },
  {
    name: "Sports",
    description: "Equipment and apparel for various sports",
    subcategories: ["Fitness", "Outdoor", "Water Sports", "Winter Sports"],
    brands: ["Nike", "Adidas", "Under Armour", "Reebok", "Puma"],
    sizes: ["One Size", "Small", "Medium", "Large"],
    colors: ["Black", "Blue", "Red", "White", "Gray"],
  },
  {
    name: "Books",
    description: "Fiction and non-fiction books",
    subcategories: ["Fiction", "Non-Fiction", "Educational", "Comics"],
    brands: ["Penguin", "HarperCollins", "Random House", "Scholastic"],
    sizes: [],
    colors: [],
  },
];

// Map to store category/subcategory IDs for quick lookup
interface CategoryMap {
  parentCategories: Map<string, mongoose.Types.ObjectId>;
  subcategories: Map<string, mongoose.Types.ObjectId>;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Creates parent categories and subcategories
 * Returns a map of category names to their IDs
 */
const seedCategories = async (): Promise<CategoryMap> => {
  console.log("📁 Creating categories and subcategories...");

  const categoryMap: CategoryMap = {
    parentCategories: new Map(),
    subcategories: new Map(),
  };

  for (const categoryData of productCategories) {
    // Create or find parent category
    let parentCategory = await Category.findOne({
      name: categoryData.name,
      parent: null,
    });

    if (!parentCategory) {
      parentCategory = new Category({
        name: categoryData.name,
        slug: generateSlug(categoryData.name),
        description: categoryData.description,
        parent: null,
      });
      await parentCategory.save();
      console.log(`  ✅ Created parent category: ${categoryData.name}`);
    } else {
      console.log(`  ℹ️  Parent category already exists: ${categoryData.name}`);
    }

    categoryMap.parentCategories.set(categoryData.name, parentCategory._id);

    // Create subcategories
    for (const subcategoryName of categoryData.subcategories) {
      let subcategory = await Category.findOne({
        name: subcategoryName,
        parent: parentCategory._id,
      });

      if (!subcategory) {
        subcategory = new Category({
          name: subcategoryName,
          slug: generateSlug(subcategoryName),
          description: faker.lorem.sentence(),
          parent: parentCategory._id,
        });
        await subcategory.save();
        console.log(
          `    ✅ Created subcategory: ${subcategoryName} (under ${categoryData.name})`
        );
      } else {
        console.log(`    ℹ️  Subcategory already exists: ${subcategoryName}`);
      }

      categoryMap.subcategories.set(subcategoryName, subcategory._id);
    }
  }

  console.log(`\n✅ Categories setup complete!\n`);
  return categoryMap;
};

/**
 * Generates a single product with variants
 */
const generateProduct = (
  categoryMap: CategoryMap
): {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  category: mongoose.Types.ObjectId;
  brand: string;
  variants: ReturnType<typeof normalizeVariants>;
  ratingsAverage: number;
  ratingsCount: number;
} => {
  // Get a random category
  const categoryData = faker.helpers.arrayElement(productCategories);
  const subcategoryName = faker.helpers.arrayElement(
    categoryData.subcategories
  );

  // Get the subcategory ID from the map
  const subcategoryId = categoryMap.subcategories.get(subcategoryName);
  if (!subcategoryId) {
    throw new Error(`Subcategory ID not found for: ${subcategoryName}`);
  }

  const brand = faker.helpers.arrayElement(categoryData.brands);
  const productName = `${brand} ${faker.commerce.productName()}`;
  const slug = `${generateSlug(productName)}-${faker.string.alphanumeric(8)}`;
  const productId = faker.string.alphanumeric(24);

  // Generate variants (70% of products have variants, 30% don't)
  const hasVariants = faker.datatype.boolean({ probability: 0.7 });
  const variants: ProductVariantInput[] = [];

  if (hasVariants) {
    const numVariants = faker.number.int({ min: 1, max: 5 });
    const usedCombinations = new Set<string>();

    for (let i = 0; i < numVariants; i++) {
      let size: string | undefined;
      let color: string | undefined;

      // 60% have both size and color, 20% have only size, 20% have only color
      const variantType = faker.number.int({ min: 1, max: 10 });
      if (variantType <= 6 && categoryData.sizes.length > 0) {
        size = faker.helpers.arrayElement(categoryData.sizes);
      }
      if (variantType <= 6 || variantType > 8) {
        if (categoryData.colors.length > 0) {
          color = faker.helpers.arrayElement(categoryData.colors);
        }
      }

      // Ensure at least one of size, color, or SKU is present
      if (!size && !color) {
        if (categoryData.sizes.length > 0) {
          size = faker.helpers.arrayElement(categoryData.sizes);
        } else if (categoryData.colors.length > 0) {
          color = faker.helpers.arrayElement(categoryData.colors);
        }
      }

      // Create unique combination key
      const comboKey = `${size || "none"}|${color || "none"}`;
      if (usedCombinations.has(comboKey)) {
        continue; // Skip duplicate combinations
      }
      usedCombinations.add(comboKey);

      const variantName = [size, color].filter(Boolean).join(" ") || undefined;

      variants.push({
        size,
        color,
        name: variantName,
        stock: faker.number.int({ min: 0, max: 1000 }),
        price: faker.datatype.boolean({ probability: 0.3 })
          ? faker.number.float({ min: 10, max: 2000, fractionDigits: 2 })
          : undefined,
        available: faker.datatype.boolean({ probability: 0.9 }),
        sku: faker.string.alphanumeric(10).toUpperCase(),
      });
    }
  }

  return {
    _id: productId,
    name: productName,
    slug,
    description: faker.commerce.productDescription(),
    images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
      faker.image.url()
    ),
    price: faker.number.float({ min: 9.99, max: 9999.99, fractionDigits: 2 }),
    category: subcategoryId,
    brand,
    variants: normalizeVariants(variants),
    ratingsAverage: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
    ratingsCount: faker.number.int({ min: 0, max: 10000 }),
  };
};

const seedProducts = async (count: number = 10000): Promise<void> => {
  try {
    await connectDatabase();

    // Step 1: Create categories and subcategories first
    const categoryMap = await seedCategories();

    // Step 2: Generate products
    console.log(`📦 Starting to generate ${count} products...`);

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < count; i += batchSize) {
      const batch: Array<{
        _id: string;
        name: string;
        slug: string;
        description: string;
        images: string[];
        price: number;
        category: mongoose.Types.ObjectId;
        brand: string;
        variants: ReturnType<typeof normalizeVariants>;
        ratingsAverage: number;
        ratingsCount: number;
      }> = [];
      const currentBatchSize = Math.min(batchSize, count - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const productData = generateProduct(categoryMap);
        batch.push(productData);
      }

      try {
        await Product.insertMany(batch as unknown[], { ordered: false });
        inserted += batch.length;
        console.log(
          `✅ Inserted ${inserted}/${count} products (${Math.round(
            (inserted / count) * 100
          )}%)`
        );
      } catch (error) {
        // Handle duplicate slug/ID errors (skip them)
        if (
          error instanceof Error &&
          (error.message.includes("duplicate key error") ||
            error.message.includes("E11000"))
        ) {
          console.log(
            `⚠️  Skipped ${currentBatchSize} products due to duplicate keys, continuing...`
          );
        } else {
          throw error;
        }
      }
    }

    console.log(`\n✅ Successfully generated ${inserted} products!`);
    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    console.log(`📊 Total products in database: ${totalProducts}`);
    console.log(`📊 Total categories in database: ${totalCategories}`);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the seed script
const count = parseInt(process.argv[2]) || 10000;
seedProducts(count)
  .then(() => {
    console.log("✨ Seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
