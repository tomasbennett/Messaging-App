import { Prisma, PrismaClient } from '@prisma/client';

// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});
import bcrypt from "bcrypt";

//AT THE END TEST IF YOU CAN IMPORT FROM THE SHARED FOLDER THROUGH A SEPARATE TSCONFIG.JSON FILE IN PRISMA FOLDER AND THEN ADD TO THE SEED COMMAND IN PACKAGE.JSON FILE
const prisma = new PrismaClient();

async function buildDefaultValues(): Promise<Prisma.UserCreateInput[]> {
    const saltRounds = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

    const defaultAdminUser: Prisma.UserCreateInput = {
        username: 'admin',
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "default_admin_password", saltRounds),
        rootFolder: {
            create: {
                name: "root",
                createdAt: new Date(),
                subFolders: {
                    create: [
                        {
                            name: "admin folder 1",
                            createdAt: new Date(1995, 11, 17)
                        },
                        {
                            name: "admin folder 2",
                            createdAt: new Date(1995, 1, 13)
                        }
                    ]
                }
            }
        }
    };


    const defaultGuestUser: Prisma.UserCreateInput = {
        username: 'guest',
        password: await bcrypt.hash(process.env.GUEST_PASSWORD || "default_guest_password", saltRounds),
        rootFolder: {
            create: {
                name: "root",
                createdAt: new Date(2026, 10, 24),
                subFolders: {
                    create: [
                        {
                            name: "second folder down POGGERS",
                            createdAt: new Date(2027, 10, 24),
                        },
                        {
                            name: "another folder down",
                            createdAt: new Date(2028, 10, 24),
                            subFolders: {
                                create: [
                                    {
                                        name: "third folder down BIG",
                                        createdAt: new Date(2029, 10, 24),
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }
    };


    const defaultUsers: Prisma.UserCreateInput[] = [
        defaultAdminUser,
        defaultGuestUser
    ];

    return defaultUsers;
}



async function insertDefaultValues() {
    const defaultUsers = await buildDefaultValues();

    for (const userData of defaultUsers) {
        await prisma.user.create({
            data: userData
        });
    }
}



async function main() {
    try {
        console.log('Seeding database with default values...');
        await insertDefaultValues();
        console.log('Database seeding completed.');
        
    } catch (error) {
        console.error('Error seeding database:', error);

    } finally {
        await prisma.$disconnect();

    }
}

main();
