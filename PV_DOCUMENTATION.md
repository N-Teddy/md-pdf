# PV Documentation

## 1. PV Entity (`src/domains/pv.entity.ts`)

```typescript
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { BaseEntityWithId } from './base.entity';
import { Convocation } from './convocation.entity';

@Entity()
export class Pv extends BaseEntityWithId {
  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  number: string;

  @Column({ nullable: true })
  mission_number: string;

  @Column({ nullable: true })
  name_representant: string;

  @Column({ nullable: true })
  type_representant: string;

  @Column({ nullable: true })
  adress: string;

  @Column({ nullable: true })
  cni: string;

  @Column({ nullable: true })
  motifs: string;

  @Column({ nullable: true })
  cni_date_delivrance: Date;

  @Column({ nullable: true })
  cni_lieu_delivrance: string;

  @Column({ nullable: true })
  rccm: string;

  @Column({ nullable: true })
  nui: string;

  @Column({ nullable: true })
  file_key: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  objets_saisies: { name: string; quantity: number }[];

  @Column('json', { nullable: true })
  documents: { name: string; key: string }[];

  @Column('simple-array', { nullable: true })
  images_pv: string[];

  @Column('simple-array', { nullable: true })
  picture_of_impounded_material: string[];

  @ManyToOne(() => Convocation, (c) => c.pv)
  @JoinColumn()
  convocation: Relation<Convocation>;
}
```

## 2. PV DTO (`src/dtos/requests/pv.dto.ts`)

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PvTypeEnum, RepresentantTypeEnum } from 'src/common/enums/global.enum';

export class CreatePvDto {
  @ApiProperty()
  @IsEnum(PvTypeEnum)
  @IsOptional()
  type: string;

  number?: string;

  @ApiProperty()
  @IsEnum(RepresentantTypeEnum)
  @IsOptional()
  type_representant: RepresentantTypeEnum;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name_representant: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  adress: string;

  @ApiProperty()
  @IsString()
  @ValidateIf(
    (o) =>
      o.type_representant === RepresentantTypeEnum.PROPRIETAIRE ||
      o.type_representant === RepresentantTypeEnum.REPRESENTANT,
  )
  @IsNotEmpty()
  cni: string;

  file_key?: string;

  @ApiProperty()
  @IsDateString()
  @ValidateIf(
    (o) =>
      o.type_representant === RepresentantTypeEnum.PROPRIETAIRE ||
      o.type_representant === RepresentantTypeEnum.REPRESENTANT,
  )
  @IsNotEmpty()
  cni_date_delivrance: string;

  @ApiProperty()
  @IsString()
  @ValidateIf(
    (o) =>
      o.type_representant === RepresentantTypeEnum.PROPRIETAIRE ||
      o.type_representant === RepresentantTypeEnum.REPRESENTANT,
  )
  @IsNotEmpty()
  cni_lieu_delivrance: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((o) => o.type_representant === RepresentantTypeEnum.SOCIETE)
  @IsNotEmpty()
  rccm: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((o) => o.type_representant === RepresentantTypeEnum.SOCIETE)
  @IsNotEmpty()
  nui: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  motifs: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Documents)
  @ApiProperty()
  @IsOptional()
  readonly documents: Documents[];

  @IsArray()
  @IsOptional()
  @ApiProperty()
  @IsString({ each: true })
  images_pv: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty()
  @IsString({ each: true })
  picture_of_impounded_material: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Objets)
  @ApiProperty()
  @IsOptional()
  readonly objets_saisies: Objets[];
}

export class Objets {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class Documents {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  key: string;
}
```

## 3. Frontend Payloads by PV Type

### A. Pose de Scellés (`CHANTIER_SCELLER`)

**Scenario:** Official sealing of a construction site.

**Payload (Individual):**

```json
{
  "type": "CHANTIER_SCELLER",
  "type_representant": "PROPRIETAIRE",
  "name_representant": "John Doe",
  "adress": "Bonapriso, Douala",
  "cni": "123456789",
  "cni_date_delivrance": "2020-01-01",
  "cni_lieu_delivrance": "Douala I",
  "motifs": "Défaut de permis de bâtir",
  "images_pv": ["s3_key_image_1.jpg"]
}
```

**Payload (Company):**

```json
{
  "type": "CHANTIER_SCELLER",
  "type_representant": "SOCIETE",
  "name_representant": "SCI IMMO",
  "adress": "Akwa, Douala",
  "rccm": "RC/DLA/2020/B/123",
  "nui": "M0123456789",
  "motifs": "Non respect des plans",
  "images_pv": ["s3_key_image_1.jpg"]
}
```

### B. Saisie des Matériels (`SAISIE`)

**Scenario:** Confiscation of equipment.
**Note:** `type_representant` and related ID fields are **NOT** required for this type.

**Payload:**

```json
{
  "type": "SAISIE",
  "name_representant": "M. Moussa",
  "objets_saisies": [
    { "name": "Brouette", "quantity": 2 },
    { "name": "Pelle", "quantity": 5 }
  ],
  "picture_of_impounded_material": ["s3_key_material_photo.jpg"]
}
```

### C. Bris de Scellés (`BRIS_SCELLER`)

**Scenario:** Reporting broken seals.

**Payload (Individual):**

```json
{
  "type": "BRIS_SCELLER",
  "type_representant": "PROPRIETAIRE",
  "name_representant": "Jane Doe",
  "adress": "Logpom, Douala",
  "cni": "1122334455",
  "cni_date_delivrance": "2019-12-12",
  "cni_lieu_delivrance": "Douala V",
  "description": "Constat de rupture des scellés sur la porte principale.",
  "motifs": "Violation de l'article 191 du Code Pénal.",
  "images_pv": ["s3_key_broken_seal.jpg"]
}
```

### D. Levée de Scellés (`LEVE_DE_SCELLE`)

**Scenario:** Authorizing work resumption.

**Payload (Individual):**

```json
{
  "type": "LEVE_DE_SCELLE",
  "type_representant": "PROPRIETAIRE",
  "name_representant": "Paul Biya",
  "adress": "Etoudi, Yaoundé",
  "cni": "000000001",
  "cni_date_delivrance": "1982-11-06",
  "cni_lieu_delivrance": "Yaoundé",
  "documents": [
    {
      "name": "Quittance de paiement amende",
      "key": "s3_key_receipt.pdf"
    }
  ]
}
```
