-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_LocationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LocationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LocationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToUser_AB_unique" ON "_LocationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToUser_B_index" ON "_LocationToUser"("B");

INSERT INTO Location VALUES('cm2a94oaj001ivwfgz833umxx','Cape Town',1728985171196,1728985171196);
INSERT INTO Location VALUES('cm2a94oak001jvwfgb5bty65x','Stellenbosch',1728985171196,1728985171196);
INSERT INTO Location VALUES('cm2a94oak001kvwfgp2p4k21i','Johannesburg',1728985171197,1728985171197);
INSERT INTO Location VALUES('cm2a94oak001lvwfgv04ot6m8','Durban',1728985171197,1728985171197);
