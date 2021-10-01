import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Service } from "./Service"

@Entity()
export class Version {

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

    // Service this version is associated with
    @ManyToOne(() => Service, service => service.versions)
    service: Service;
}