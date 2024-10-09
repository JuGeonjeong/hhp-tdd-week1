export class UrlValue {
    constructor(private readonly value: string) {
        if (value === '' || !value) {
            throw new Error('URL이 없습니다.');
        }
        try {
            new URL(value);
            this.value = value;
        } catch (error) {
            throw new Error('유효하지 않은 URL 형식입니다.');
        }
    }

    getValue() {
        return this.value;
    }
}

export class CompanyName {
    constructor(private readonly value: string) {
        if (value === '' || !value) {
            throw new Error('회사명이 없습니다.');
        }
    }

    getValue() {
        return this.value;
    }
}

export class UrlContents {
    constructor(private readonly value: string) {
        if (value === '' || !value) {
            throw new Error('URL Content가 없습니다.');
        }
    }

    getValue() {
        return this.value;
    }
}

export class UrlInterview {
    constructor(
        private readonly urlValue: UrlValue,
        private readonly companyName: CompanyName,
        private readonly urlContent: UrlContents,
    ) {}
}

const urlValue = new UrlValue('velog');
const companyName = new CompanyName('velog');
const urlContents = new UrlContents('채용 공고 내용');

const urlInterview = new UrlInterview(urlValue, companyName, urlContents);
