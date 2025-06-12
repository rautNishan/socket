import { MigrationInterface, QueryRunner } from "typeorm";

export class MembersInit1749699508820 implements MigrationInterface {
    name = 'MembersInit1749699508820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "members" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" bigint, "room_id" bigint, CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da404b5fd9c390e25338996e2d" ON "members" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_019a587dba7f46c0b32be50d5f" ON "members" ("room_id") `);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_019a587dba7f46c0b32be50d5f8" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_019a587dba7f46c0b32be50d5f8"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_019a587dba7f46c0b32be50d5f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da404b5fd9c390e25338996e2d"`);
        await queryRunner.query(`DROP TABLE "members"`);
    }

}
