import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Version } from "./Version"

@Entity()
export class Service {

    @PrimaryGeneratedColumn()
    id: number;

    // Default is varchar(255), which is fine, could change length
    @Column(/* { length: 256 } */)
    name: string;

    @Column("text")
    description: string;

    // There may be some problems with "timestamp", and potentially "timestamptz" is better
    // https://github.com/typeorm/typeorm/issues/4519
    // It's not fatal enough for me to worry about it for this now
    @Column("timestamp", {default: (): string => 'LOCALTIMESTAMP' })
    created_at: Date;

    // List of versions, in another table
    @OneToMany(() => Version, version => version.service)
    versions: Version[];
}