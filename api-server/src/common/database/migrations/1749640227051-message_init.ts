import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageInit1749640227051 implements MigrationInterface {
  name = "MessageInit1749640227051";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "message" text, "from" bigint, "room_id" bigint, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_671851391885ee9558647e68fd" ON "messages" ("from") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1dda4fc8dbeeff2ee71f0088ba" ON "messages" ("room_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_671851391885ee9558647e68fd0" FOREIGN KEY ("from") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0"`
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_671851391885ee9558647e68fd0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1dda4fc8dbeeff2ee71f0088ba"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_671851391885ee9558647e68fd"`
    );
    await queryRunner.query(`DROP TABLE "messages"`);
  }
}
