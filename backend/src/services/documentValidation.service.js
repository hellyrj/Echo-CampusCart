// services/documentValidation.service.js
export class DocumentValidationService {
    async validateDocumentUrl(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return {
                isValid: response.ok,
                contentType: response.headers.get('content-type'),
                size: response.headers.get('content-length')
            };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
    
    async validateAllDocuments(legalDocuments) {
        const results = await Promise.all(
            legalDocuments.map(doc => this.validateDocumentUrl(doc.documentUrl))
        );
        
        return results.every(result => result.isValid);
    }
}