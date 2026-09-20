import { TripMemberRole, TripMemberStatus } from 'src/constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('trip_members')
@Index(['tripId', 'userId'], { unique: true })
export class TripMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tripId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: TripMemberRole,
  })
  role: TripMemberRole;

  @Column({
    type: 'enum',
    enum: TripMemberStatus,
    default: TripMemberStatus.ACTIVE,
  })
  status: TripMemberStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}