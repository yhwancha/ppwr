"use client";

import {
  AddressEnFields,
  CheckSection,
  Field,
  FieldGroup,
  FilePickField,
  SelectField,
  StepCard,
  TextareaField,
} from "./parts";
import { EU_MEMBER_STATES_EN } from "@/src/lib/ppwr-product-spec";

export type IdentityForm = {
  contactName: string;
  department: string;
  position: string;
  phone: string;
  email: string;
  companyKo: string;
  companyEn: string;
  addressKo: string;
  addressDetailKo: string;
  buildingNumber: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  businessNo: string;
  corporateNo: string;
  isEuImporter: boolean;
  hasEuRepresentative: boolean;
  hasEprRegistration: boolean;

  /* EU 수입자 정보 — isEuImporter 일 때만 */
  importerCompanyEn: string;
  importerBuildingNumber: string;
  importerStreet: string;
  importerCity: string;
  importerCountry: string;
  importerPostalCode: string;
  importerContactName: string;
  importerContactEmail: string;

  /* EU 권한대리인 정보 — hasEuRepresentative 일 때만 */
  repCompanyEn: string;
  repBuildingNumber: string;
  repStreet: string;
  repCity: string;
  repCountry: string;
  repPostalCode: string;
  repContactName: string;
  repContactEmail: string;
  repMandateScope: string;

  /* EPR 등록 정보 — hasEprRegistration 일 때만 */
  eprMemberState: string;
  eprRegistrationNo: string;
  eprRegistrant: string;
};

export const EMPTY_IDENTITY: IdentityForm = {
  contactName: "",
  department: "",
  position: "",
  phone: "",
  email: "",
  companyKo: "",
  companyEn: "",
  addressKo: "",
  addressDetailKo: "",
  buildingNumber: "",
  street: "",
  city: "",
  country: "",
  postalCode: "",
  businessNo: "",
  corporateNo: "",
  isEuImporter: false,
  hasEuRepresentative: false,
  hasEprRegistration: false,

  importerCompanyEn: "",
  importerBuildingNumber: "",
  importerStreet: "",
  importerCity: "",
  importerCountry: "",
  importerPostalCode: "",
  importerContactName: "",
  importerContactEmail: "",

  repCompanyEn: "",
  repBuildingNumber: "",
  repStreet: "",
  repCity: "",
  repCountry: "",
  repPostalCode: "",
  repContactName: "",
  repContactEmail: "",
  repMandateScope: "",

  eprMemberState: "",
  eprRegistrationNo: "",
  eprRegistrant: "",
};

/** 1단계에서 비어 있으면 안 되는 필드 */
export const IDENTITY_REQUIRED: (keyof IdentityForm)[] = [
  "contactName",
  "department",
  "position",
  "phone",
  "email",
  "companyKo",
  "companyEn",
  "addressKo",
  "addressDetailKo",
  "buildingNumber",
  "street",
  "city",
  "country",
  "postalCode",
  "businessNo",
];

export default function StepIdentity({
  value,
  onChange,
  mandateFiles,
  onMandateFilesChange,
}: {
  value: IdentityForm;
  onChange: (patch: Partial<IdentityForm>) => void;
  /** 위임 문서 — 아직 붙일 엔티티가 없어 상위에서 메모리로만 들고 있다 */
  mandateFiles: File[];
  onMandateFilesChange: (next: File[]) => void;
}) {
  const set = (k: keyof IdentityForm) => (v: string) => onChange({ [k]: v });

  return (
    <StepCard
      step={1}
      title="제조자 / 기업 식별"
      description="프로필 관리의 내용과 동일합니다. 필요하다면 수정할 수 있어요."
    >
      <FieldGroup title="담당자 정보">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="성명" required value={value.contactName} onChange={set("contactName")} />
          <Field label="부서" required value={value.department} onChange={set("department")} />
          <Field label="직책" required value={value.position} onChange={set("position")} />
          <Field label="연락처" required value={value.phone} onChange={set("phone")} />
        </div>
        <div className="mt-4">
          <Field
            label="이메일"
            required
            type="email"
            value={value.email}
            onChange={set("email")}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="기업 정보">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="기업명 (국문)" required value={value.companyKo} onChange={set("companyKo")} />
          <Field label="기업명 (영문)" required value={value.companyEn} onChange={set("companyEn")} />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* 국문 주소 */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              본사 주소 (국문) <span className="text-danger">*</span>
            </p>
            <Field label="기본 주소" required value={value.addressKo} onChange={set("addressKo")} />
            <Field
              label="상세 주소"
              required
              value={value.addressDetailKo}
              onChange={set("addressDetailKo")}
            />
          </div>

          {/* 영문 주소 */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              본사 주소 (영문) <span className="text-danger">*</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Building Number"
                required
                value={value.buildingNumber}
                onChange={set("buildingNumber")}
              />
              <Field label="Street" required value={value.street} onChange={set("street")} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" required value={value.city} onChange={set("city")} />
              <Field label="Country" required value={value.country} onChange={set("country")} />
              <Field
                label="Postal Code"
                required
                value={value.postalCode}
                onChange={set("postalCode")}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="사업자등록번호"
            required
            hint="하이픈(-)은 제외하고 숫자만 입력."
            value={value.businessNo}
            onChange={set("businessNo")}
          />
          <Field
            label="법인등록번호"
            hint="하이픈(-)은 제외하고 숫자만 입력."
            value={value.corporateNo}
            onChange={set("corporateNo")}
          />
        </div>

        <div className="mt-5 space-y-2.5">
          <CheckSection
            label="EU 수입자이신가요?"
            checked={value.isEuImporter}
            onChange={(v) => onChange({ isEuImporter: v })}
            title="EU 수입자 정보"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="기업명 (영문)" value={value.importerCompanyEn} onChange={set("importerCompanyEn")} />
              <AddressEnFields
                value={{
                  buildingNumber: value.importerBuildingNumber,
                  street: value.importerStreet,
                  city: value.importerCity,
                  country: value.importerCountry,
                  postalCode: value.importerPostalCode,
                }}
                onChange={(patch) =>
                  onChange({
                    importerBuildingNumber: patch.buildingNumber ?? value.importerBuildingNumber,
                    importerStreet: patch.street ?? value.importerStreet,
                    importerCity: patch.city ?? value.importerCity,
                    importerCountry: patch.country ?? value.importerCountry,
                    importerPostalCode: patch.postalCode ?? value.importerPostalCode,
                  })
                }
              />
              <Field label="담당자 성명" value={value.importerContactName} onChange={set("importerContactName")} />
              <Field
                label="담당자 이메일"
                type="email"
                value={value.importerContactEmail}
                onChange={set("importerContactEmail")}
              />
            </div>
          </CheckSection>

          <CheckSection
            label="EU 권한 대리인이 있나요?"
            checked={value.hasEuRepresentative}
            onChange={(v) => onChange({ hasEuRepresentative: v })}
            title="EU 권한대리인 정보"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="기업명 (영문)" value={value.repCompanyEn} onChange={set("repCompanyEn")} />
              <AddressEnFields
                value={{
                  buildingNumber: value.repBuildingNumber,
                  street: value.repStreet,
                  city: value.repCity,
                  country: value.repCountry,
                  postalCode: value.repPostalCode,
                }}
                onChange={(patch) =>
                  onChange({
                    repBuildingNumber: patch.buildingNumber ?? value.repBuildingNumber,
                    repStreet: patch.street ?? value.repStreet,
                    repCity: patch.city ?? value.repCity,
                    repCountry: patch.country ?? value.repCountry,
                    repPostalCode: patch.postalCode ?? value.repPostalCode,
                  })
                }
              />
              <Field label="담당자 성명" value={value.repContactName} onChange={set("repContactName")} />
              <Field
                label="담당자 이메일"
                type="email"
                value={value.repContactEmail}
                onChange={set("repContactEmail")}
              />
              <TextareaField
                label="위임 범위"
                value={value.repMandateScope}
                onChange={set("repMandateScope")}
                placeholder="입력된 위임 범위입니다."
              />
              <FilePickField
                label="위임 문서"
                files={mandateFiles}
                onAdd={(picked) => onMandateFilesChange([...mandateFiles, ...picked])}
                onRemove={(i) => onMandateFilesChange(mandateFiles.filter((_, x) => x !== i))}
              />
            </div>
          </CheckSection>

          <CheckSection
            label="EPR 등록 정보가 있나요?"
            checked={value.hasEprRegistration}
            onChange={(v) => onChange({ hasEprRegistration: v })}
            title="EPR 등록 정보"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                label="회원국"
                value={value.eprMemberState}
                onChange={set("eprMemberState")}
                options={EU_MEMBER_STATES_EN}
              />
              <Field
                label="등록 번호"
                value={value.eprRegistrationNo}
                onChange={set("eprRegistrationNo")}
                placeholder="DE1234567890123"
              />
              <Field
                label="등록 주체"
                value={value.eprRegistrant}
                onChange={set("eprRegistrant")}
                placeholder="입력된 등록 주체"
              />
            </div>
          </CheckSection>
        </div>
      </FieldGroup>
    </StepCard>
  );
}
