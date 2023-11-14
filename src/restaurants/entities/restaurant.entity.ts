import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true }) // 이 inputType이 스키마에 포함되지 않길 원한다는 뜻 그리고 이걸 어딘가에서 복사해서 쓴다는 의미
@ObjectType()
@Entity()
export class Restaurant {
  // 여기 type 는 큰 의미 없다 편한대로 작성해도 된다.

  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Boolean, { defaultValue: true })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  ownersName: string;

  @Field((type) => String)
  @Column()
  @IsString()
  categoryName: string;
}

// Graphql 에서 @ObjectType
// -> 자동으로 스키마를 빌드하기 위해 사용하는 Graphql 데코레이터

// TypeOrm
// -> @Entity 는 TypeOrm이 db에 이걸 저장하게 해준다.

// 둘다 사용해서 grqphql 스키마와 db에 저장되는 데이터 형식을 만들 수 있다.
