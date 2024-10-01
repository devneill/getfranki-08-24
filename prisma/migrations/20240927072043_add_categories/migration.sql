-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_CategoryToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CategoryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CategoryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToUser_AB_unique" ON "_CategoryToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToUser_B_index" ON "_CategoryToUser"("B");





-- You can run this command in the seed script to generate more cateegories
-- console.time('🗂️ Created supplier categories...')
-- 	await prisma.category.create({
-- 		data: {
-- 			name: 'Catering',
-- 		},
-- 	})
-- 	console.timeEnd('🗂️ Created supplier categories...')


INSERT INTO Category VALUES('cm1kgkhkc0000358sugp1xo8z','Catering',1727425545708,1727425545708);
INSERT INTO Category VALUES('cm1kgkhkd0001358s48g5hmje','Staffing & Bar Services',1727425545709,1727782159005);
INSERT INTO Category VALUES('cm1kgkhkd0002358squxilggn','Decor',1727425545710,1727425545710);
INSERT INTO Category VALUES('cm1kgkhke0003358sntodfu9w','Photographer',1727425545710,1727425545710);
INSERT INTO Category VALUES('cm1kgkhke0004358swr76myul','Videographer',1727425545711,1727425545711);
INSERT INTO Category VALUES('cm1kgkhke0005358slu47hc1h','Sound & Lighting',1727425545711,1727782147056);
INSERT INTO Category VALUES('cm1kgkhkf0006358sezlcd6qu','DJ',1727425545711,1727425545711);
INSERT INTO Category VALUES('cm1kgkhkf0007358skqn3ky6w','Band',1727425545712,1727425545712);
INSERT INTO Category VALUES('cm1kgkhkf0008358scg56779u','Security',1727425545712,1727425545712);
INSERT INTO Category VALUES('cm1kgkhkg0009358sg39p18n7','Other',1727425545712,1727425545712);
INSERT INTO Category VALUES('cm1qcw2zv001k8ooh2z3wl8pf','Flowers',1727782165292,1727782181041);
INSERT INTO Category VALUES('cm1qcwf5d001l8oohfp41xct4','Cakes',1727782181041,1727782167183);
INSERT INTO Category VALUES('cm1qcwt28001m8oohb502uxqy','Venue',1727782199072,1727782194998);
INSERT INTO Category VALUES('cm1qcwz0n001n8oohncegnmoc','Transportation',1727782206792,1727782231973);
INSERT INTO Category VALUES('cm1qcx9tw001o8oohifmq7e8l','Ice Cream & Coffee Bars',1727782220804,1727782215848);
INSERT INTO Category VALUES('cm1qcy04z001p8ooh5hp35u3w','Games & Entertainment',1727782254900,1727782238315);
INSERT INTO Category VALUES('cm1qcybg2001q8ooh2qi17qz4','Hiring',1727782269554,1727782260228);
INSERT INTO Category VALUES('cm1qcywhl001r8ooh0b2xe1o7','Printing, Branding & Stationary',1727782296825,1727782275766);
INSERT INTO Category VALUES('cm1qcz3jy001s8oohbl0f484d','Gifting',1727782305983,1727782357790);
INSERT INTO Category VALUES('cm1qczyep001u8oohncovbd0t','Planning',1727782345969,1727782307396);
INSERT INTO Category VALUES('cm1qd0pub001v8oohgebq5c8r','Tents',1727782381523,1727782373648);
