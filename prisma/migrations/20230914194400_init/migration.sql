-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoteImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "noteId" TEXT NOT NULL,
    CONSTRAINT "NoteImage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expirationDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");

-- CreateIndex
CREATE INDEX "Note_ownerId_updatedAt_idx" ON "Note"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "NoteImage_noteId_idx" ON "NoteImage"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_target_type_key" ON "Verification"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_providerName_providerId_key" ON "Connection"("providerName", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

--------------------------------- Manual Seeding --------------------------
-- Hey there, Kent here! This is how you can reliably seed your database with
-- some data. You edit the migration.sql file and that will handle it for you.

-- The user Roles and Permissions are seeded here.
-- If you'd like to customise roles and permissions, you can edit and add the code below to your `prisma/seed.ts` file.
-- Seed your development database with `npx prisma db seed`
-- Create a sql dump of your database with `sqlite3 prisma/data.db .dump > seed.sql`
-- Replace the SQL below with your new Roles & Permissions related SQL from `seed.sql`

-- console.time('🔑 Created permissions...')
-- 	const entities = ['user', 'event', 'booking']
-- 	const actions = ['create', 'read', 'update', 'delete']
-- 	const accesses = ['own', 'any'] as const

-- 	let permissionsToCreate = []
-- 	for (const entity of entities) {
-- 		for (const action of actions) {
-- 			for (const access of accesses) {
-- 				permissionsToCreate.push({ entity, action, access })
-- 			}
-- 		}
-- 	}
-- 	await prisma.permission.createMany({ data: permissionsToCreate })
-- 	console.timeEnd('🔑 Created permissions...')

-- 	console.time('👑 Created roles...')
-- 	await prisma.role.create({
-- 		data: {
-- 			name: 'admin',
-- 			permissions: {
-- 				connect: await prisma.permission.findMany({
-- 					select: { id: true },
-- 					where: { access: 'any' },
-- 				}),
-- 			},
-- 		},
-- 	})
-- 	await prisma.role.create({
-- 		data: {
-- 			name: 'organiser',
-- 			permissions: {
-- 				connect: await prisma.permission.findMany({
-- 					select: { id: true },
-- 					where: { access: 'own' },
-- 				}),
-- 			},
-- 		},
-- 	})
-- 	await prisma.role.create({
-- 		data: {
-- 			name: 'supplier',
-- 			permissions: {
-- 				connect: await prisma.permission.findMany({
-- 					select: { id: true },
-- 					where: { access: 'own' },
-- 				}),
-- 			},
-- 		},
-- 	})
-- 	console.timeEnd('👑 Created roles...')

INSERT INTO Permission VALUES('cm0gj7un30000tllhzrr2r1i9','create','user','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30001tllhoncnzncd','create','user','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30002tllhhm6kr0j0','read','user','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30003tllh2sioou2w','read','user','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30004tllhydo2jl8m','update','user','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30005tllh353az7ja','update','user','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30006tllhqyun1iuv','delete','user','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30007tllhsef60hag','delete','user','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30008tllh5wacam9m','create','event','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un30009tllhdn3q74hr','create','event','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000atllh39c3ek2c','read','event','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000btllh6raifrwe','read','event','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000ctllhc53e78qg','update','event','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000dtllhset3w1r1','update','event','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000etllhiiv2u7hy','delete','event','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000ftllhcb8jm1uq','delete','event','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000gtllh9n4qp4ak','create','booking','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000htllhwrz6f8we','create','booking','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000itllhg2r9ge6v','read','booking','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000jtllh1sc3pfd1','read','booking','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000ktllhgzbe8v9p','update','booking','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000ltllho7q9modb','update','booking','any','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000mtllhr2tjhyu6','delete','booking','own','',1725011347935,1725011347935);
INSERT INTO Permission VALUES('cm0gj7un3000ntllho25snc72','delete','booking','any','',1725011347935,1725011347935);

INSERT INTO Role VALUES('cm0gj7un7000otllhlwhp8yf6','admin','',1725011347939,1725011347939);
INSERT INTO Role VALUES('cm0gj7un8000ptllhqlqi15wk','organiser','',1725011347941,1725011347941);
INSERT INTO Role VALUES('cm0gj7un9000qtllhpm6in79k','supplier','',1725011347941,1725011347941);

INSERT INTO _PermissionToRole VALUES('cm0gj7un30001tllhoncnzncd','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30003tllh2sioou2w','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30005tllh353az7ja','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30007tllhsef60hag','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30009tllhdn3q74hr','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000btllh6raifrwe','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000dtllhset3w1r1','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ftllhcb8jm1uq','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000htllhwrz6f8we','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000jtllh1sc3pfd1','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ltllho7q9modb','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ntllho25snc72','cm0gj7un7000otllhlwhp8yf6');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30000tllhzrr2r1i9','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30002tllhhm6kr0j0','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30004tllhydo2jl8m','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30006tllhqyun1iuv','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30008tllh5wacam9m','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000atllh39c3ek2c','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ctllhc53e78qg','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000etllhiiv2u7hy','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000gtllh9n4qp4ak','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000itllhg2r9ge6v','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ktllhgzbe8v9p','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000mtllhr2tjhyu6','cm0gj7un8000ptllhqlqi15wk');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30000tllhzrr2r1i9','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30002tllhhm6kr0j0','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30004tllhydo2jl8m','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30006tllhqyun1iuv','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un30008tllh5wacam9m','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000atllh39c3ek2c','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ctllhc53e78qg','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000etllhiiv2u7hy','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000gtllh9n4qp4ak','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000itllhg2r9ge6v','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000ktllhgzbe8v9p','cm0gj7un9000qtllhpm6in79k');
INSERT INTO _PermissionToRole VALUES('cm0gj7un3000mtllhr2tjhyu6','cm0gj7un9000qtllhpm6in79k');
