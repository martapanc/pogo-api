-- AlterTable
CREATE SEQUENCE region_id_seq;
ALTER TABLE "Region" ALTER COLUMN "id" SET DEFAULT nextval('region_id_seq');
ALTER SEQUENCE region_id_seq OWNED BY "Region"."id";
