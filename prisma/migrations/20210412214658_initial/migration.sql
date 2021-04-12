-- CreateTable
CREATE TABLE "User" (
    "snowflake" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    PRIMARY KEY ("snowflake")
);
