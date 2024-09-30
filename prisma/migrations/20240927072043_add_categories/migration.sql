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
INSERT INTO Category VALUES('cm1kgkhkd0001358s48g5hmje','Bar Services',1727425545709,1727425545709);
INSERT INTO Category VALUES('cm1kgkhkd0002358squxilggn','Decor',1727425545710,1727425545710);
INSERT INTO Category VALUES('cm1kgkhke0003358sntodfu9w','Photographer',1727425545710,1727425545710);
INSERT INTO Category VALUES('cm1kgkhke0004358swr76myul','Videographer',1727425545711,1727425545711);
INSERT INTO Category VALUES('cm1kgkhke0005358slu47hc1h','Sound Equipment',1727425545711,1727425545711);
INSERT INTO Category VALUES('cm1kgkhkf0006358sezlcd6qu','DJ',1727425545711,1727425545711);
INSERT INTO Category VALUES('cm1kgkhkf0007358skqn3ky6w','Band',1727425545712,1727425545712);
INSERT INTO Category VALUES('cm1kgkhkf0008358scg56779u','Security',1727425545712,1727425545712);
INSERT INTO Category VALUES('cm1kgkhkg0009358sg39p18n7','Other',1727425545712,1727425545712);
