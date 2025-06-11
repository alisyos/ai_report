# AI 보고서 생성기

OpenAI API를 활용한 전문 보고서 자동 생성 시스템입니다. 사용자가 입력한 정보를 바탕으로 구조화된 보고서를 자동으로 생성합니다.

## 주요 기능

### 🚀 통합 워크플로우
- **단일 페이지 인터페이스**: 좌우 분할 레이아웃으로 효율적인 작업 환경
- **실시간 결과 확인**: 입력과 동시에 결과를 바로 확인
- **탭 기반 결과 표시**: 목차와 보고서를 탭으로 구분하여 표시

### 📁 다양한 입력 방식 지원
- **직접 입력**: 텍스트 직접 작성
- **파일 업로드**: TXT, DOC, DOCX 파일 업로드 지원
- **다중 인코딩**: UTF-8, EUC-KR 등 다양한 인코딩 자동 감지

### 🎨 사용자 맞춤 설정
- **대상별 맞춤**: 내부 팀, 임원, 일반 대중
- **톤/스타일**: 격식체, 친근한, 전문적
- **자동 구조화**: Executive Summary, 본문 자동 생성

### 💾 편리한 결과 활용
- **다운로드**: TXT 파일로 저장
- **클립보드 복사**: 원클릭 복사 기능
- **실시간 미리보기**: 생성 과정 실시간 확인

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form + Zod
- **AI**: OpenAI GPT-4.1
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd ai_report
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 OpenAI API 키를 설정합니다:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 사용 방법

### 좌측 패널: 정보 입력
- **목적**: 보고서 작성 목적 입력
- **주제**: 보고서 주제 입력
- **대상**: 내부 팀, 임원, 일반 대중 중 선택
- **톤/스타일**: 격식체, 친근한, 전문적 중 선택
- **내용**: 직접 입력 또는 파일 업로드

### 우측 패널: 결과 확인
- **목차 탭**: AI가 생성한 목차 구조 확인 및 보고서 생성 버튼
- **보고서 탭**: 완성된 보고서 내용 확인
- **액션 버튼**: 복사, 다운로드, 새로 시작 기능

### 워크플로우
1. 좌측에서 보고서 정보 입력 후 "목차 생성하기" 클릭
2. 우측 목차 탭에서 생성된 목차 확인
3. "보고서 생성" 버튼 클릭하여 최종 보고서 생성
4. 보고서 탭에서 완성된 보고서 확인 및 다운로드

## 파일 업로드 지원

### 지원 파일 형식
- **TXT**: 텍스트 파일 (실시간 미리보기 제공)
- **DOC**: Microsoft Word 문서
- **DOCX**: Microsoft Word 문서 (최신 형식)

### 파일 제한사항
- 최대 파일 크기: 10MB
- 인코딩: UTF-8, EUC-KR 자동 감지
- 바이너리 파일 자동 필터링

## API 엔드포인트

### POST /api/generate-outline
목차 생성 API
```json
{
  "purpose": "보고서 목적",
  "topic": "보고서 주제",
  "audience": "internal_team|executives|general_public",
  "content": "보고서 내용",
  "tone": "formal|friendly|professional"
}
```

### POST /api/generate-report
보고서 생성 API
```json
{
  "titleStructure": "목차 구조",
  "audience": "대상",
  "content": "내용",
  "tone": "톤/스타일"
}
```

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── generate-outline/
│   │   └── generate-report/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # 메인 페이지 (좌우 분할 레이아웃)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── OutlineForm.tsx          # 입력 폼 컴포넌트
├── lib/
│   └── openai.ts
└── types/
    └── index.ts
```

## UI 특징

### 반응형 레이아웃
- **데스크톱**: 좌우 분할 레이아웃 (2열)
- **모바일**: 세로 스택 레이아웃 (1열)

### 탭 인터페이스
- **목차 탭**: 생성된 목차 구조 표시, 보고서 생성 버튼
- **보고서 탭**: 완성된 보고서 내용 표시
- **상태 표시**: 완료된 단계에 체크 아이콘 표시

### 로딩 상태
- **목차 생성**: 스피너와 함께 "목차를 생성하고 있습니다..." 메시지
- **보고서 생성**: 스피너와 함께 "보고서를 생성하고 있습니다..." 메시지

## 환경 설정

### OpenAI API 설정
1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. `.env.local` 파일에 API 키 설정
3. 사용 모델: GPT-4.1 (설정 변경 가능)

### 모델 변경
`src/lib/openai.ts` 파일에서 모델 설정 변경 가능:
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4.1', // 원하는 모델로 변경
  // ...
});
```

## 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### 환경 변수 설정
Vercel 대시보드에서 `OPENAI_API_KEY` 환경 변수 설정 필요

## 개발 정보

- **개발 환경**: Node.js 18+
- **패키지 매니저**: npm
- **코드 스타일**: TypeScript + ESLint
- **UI 프레임워크**: Tailwind CSS

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
