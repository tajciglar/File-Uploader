/*
  Warnings:

  - You are about to drop the `_FileToUser` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `created_by` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_FileToUser" DROP CONSTRAINT "_FileToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_FileToUser" DROP CONSTRAINT "_FileToUser_B_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "created_by",
ADD COLUMN     "created_by" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_FileToUser";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
