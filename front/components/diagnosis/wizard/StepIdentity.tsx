"use client";

import { CheckRow, Field, FieldGroup, StepCard } from "./parts";

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
}: {
  value: IdentityForm;
  onChange: (patch: Partial<IdentityForm>) => void;
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
          <CheckRow
            label="EU 수입자이신가요?"
            checked={value.isEuImporter}
            onChange={(v) => onChange({ isEuImporter: v })}
          />
          <CheckRow
            label="EU 권한 대리인이 있나요?"
            checked={value.hasEuRepresentative}
            onChange={(v) => onChange({ hasEuRepresentative: v })}
          />
          <CheckRow
            label="EPR 등록 정보가 있나요?"
            checked={value.hasEprRegistration}
            onChange={(v) => onChange({ hasEprRegistration: v })}
          />
        </div>
      </FieldGroup>
    </StepCard>
  );
}
