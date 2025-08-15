/* جمعيتي - نظام التسجيل الشامل */
class RegistrationManager {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {};
        this.init();
    }
    init() {
        this.bindEvents();
        this.setupValidation();
        this.loadSavedData();
    }
    bindEvents() {
        // ربط نموذج التسجيل
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmission();
        });
        // حفظ البيانات عند التغيير
        this.form.addEventListener('change', () => {
            this.saveFormData();
        });
        // ربط تبديل المحافظة والمدينة
        const governorateSelect = document.getElementById('governorate');
        const citySelect = document.getElementById('city');
        
        if (governorateSelect && citySelect) {
            governorateSelect.addEventListener('change', () => {
                this.updateCities(governorateSelect.value, citySelect);
            });
        }
        // ربط زر المسح
        const resetBtn = this.form.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmReset();
            });
        }
    }
    setupValidation() {
        // التحقق من رقم الهاتف الأردني
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validatePhoneNumber(input);
            });
        });
        // التحقق من البريد الإلكتروني
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }
        // التحقق من تاريخ الميلاد
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) {
            birthDateInput.addEventListener('change', () => {
                this.validateBirthDate(birthDateInput);
            });
        }
        // التحقق من الحقول المطلوبة
        const requiredInputs = document.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateRequired(input);
            });
        });
    }
    validatePhoneNumber(input) {
        const phoneValue = input.value.trim();
        const jordanPhoneRegex = /^(\+962|00962|962|0)?[7][7-9]\d{7}$/;
        
        if (phoneValue && !jordanPhoneRegex.test(phoneValue.replace(/\s+/g, ''))) {
            this.showFieldError(input, 'رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف أردني صالح');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }
    validateEmail(input) {
        const emailValue = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailValue && !emailRegex.test(emailValue)) {
            this.showFieldError(input, 'البريد الإلكتروني غير صحيح');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }
    validateBirthDate(input) {
        const birthDate = new Date(input.value);
        const today = new Date();
        const minAge = 16; // الحد الأدنى للعمر
        const maxAge = 100; // الحد الأقصى للعمر
        
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < minAge) {
            this.showFieldError(input, `يجب أن يكون العمر ${minAge} سنة على الأقل`);
            return false;
        } else if (age > maxAge) {
            this.showFieldError(input, 'تاريخ الميلاد غير صحيح');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }
    validateRequired(input) {
        if (input.required && !input.value.trim()) {
            this.showFieldError(input, 'هذا الحقل مطلوب');
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        input.classList.add('error');
        input.parentNode.appendChild(errorDiv);
    }
    clearFieldError(input) {
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    updateCities(governorate, citySelect) {
        const cities = {
            'amman': [
                { value: 'amman', text: 'عمان' },
                { value: 'wadi_sir', text: 'وادي السير' },
                { value: 'sweileh', text: 'سويلح' },
                { value: 'abu_nsair', text: 'أبو نصير' }
            ],
            'irbid': [
                { value: 'irbid', text: 'إربد' },
                { value: 'ramtha', text: 'الرمثا' },
                { value: 'mafraq', text: 'المفرق' }
            ],
            'zarqa': [
                { value: 'zarqa', text: 'الزرقاء' },
                { value: 'russeifa', text: 'الرصيفة' },
                { value: 'hashemite', text: 'الهاشمية' }
            ],
            // إضافة المزيد من المدن حسب الحاجة
        };
        // مسح الخيارات الحالية
        citySelect.innerHTML = '<option value="">اختر المدينة</option>';
        // إضافة المدن الجديدة
        if (cities[governorate]) {
            cities[governorate].forEach(city => {
                const option = document.createElement('option');
                option.value = city.value;
                option.textContent = city.text;
                citySelect.appendChild(option);
            });
        }
    }
    saveFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // جمع البيانات العادية
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // إذا كان الحقل موجود مسبقاً، اجعله مصفوفة (للـ checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        // حفظ في التخزين المحلي
        localStorage.setItem('jamiyati_registration_draft', JSON.stringify(data));
    }
    loadSavedData() {
        const savedData = localStorage.getItem('jamiyati_registration_draft');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.populateForm(data);
            } catch (error) {
                console.error('خطأ في تحميل البيانات المحفوظة:', error);
            }
        }
    }
    populateForm(data) {
        Object.keys(data).forEach(key => {
            const element = this.form.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    if (Array.isArray(data[key])) {
                        const checkboxes = this.form.querySelectorAll(`input[name="${key}"]`);
                        checkboxes.forEach(cb => {
                            cb.checked = data[key].includes(cb.value);
                        });
                    } else {
                        element.checked = true;
                    }
                } else if (element.type === 'radio') {
                    const radio = this.form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = data[key];
                }
            }
        });
    }
    async handleSubmission() {
        // إظهار مؤشر التحميل
        this.showLoadingState(true);
        try {
            // التحقق من صحة البيانات
            if (!this.validateForm()) {
                this.showLoadingState(false);
                return;
            }
            // جمع البيانات
            const formData = this.collectFormData();
            // محاكاة إرسال البيانات
            await this.submitRegistration(formData);
            // عرض رسالة نجاح
            this.showSuccessMessage();
            // مسح البيانات المحفوظة
            localStorage.removeItem('jamiyati_registration_draft');
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            this.showErrorMessage('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
        } finally {
            this.showLoadingState(false);
        }
    }
    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateRequired(field)) {
                isValid = false;
            }
        });
        // التحقق من الموافقات المطلوبة
        const requiredCheckboxes = this.form.querySelectorAll('input[name="agreement"][value="terms"], input[name="agreement"][value="privacy"]');
        requiredCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                this.showFieldError(checkbox, 'يجب الموافقة على هذا البند');
                isValid = false;
            }
        });
        if (!isValid) {
            this.showErrorMessage('يرجى تصحيح الأخطاء المذكورة أعلاه');
        }
        return isValid;
    }
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {
            personalInfo: {},
            contactInfo: {},
            professionalInfo: {},
            preferences: {},
            agreements: []
        };
        // تصنيف البيانات
        for (let [key, value] of formData.entries()) {
            if (['fullName', 'nationalId', 'birthDate', 'gender', 'maritalStatus'].includes(key)) {
                data.personalInfo[key] = value;
            } else if (['phoneNumber', 'whatsapp', 'email', 'emergencyContact'].includes(key)) {
                data.contactInfo[key] = value;
            } else if (['education', 'profession', 'workplace', 'monthlyIncome'].includes(key)) {
                data.professionalInfo[key] = value;
            } else if (key === 'agreement') {
                data.agreements.push(value);
            } else if (key === 'interests') {
                if (!data.preferences.interests) data.preferences.interests = [];
                data.preferences.interests.push(value);
            } else {
                data[key] = value;
            }
        }
        // إضافة بيانات إضافية
        data.registrationDate = new Date().toISOString();
        data.status = 'pending';
        data.id = 'REG_' + Date.now();
        
        // تحديد الدور الافتراضي بناء على المعلومات المقدمة
        data.role = this.determineUserRole(data);
        
        // إنشاء حساب مستخدم للنظام
        data.userAccount = this.createUserAccount(data);
        
        return data;
    }
    
    determineUserRole(data) {
        // تحديد الدور بناء على المعلومات المقدمة
        const interests = data.preferences.interests || [];
        const availability = data.availability;
        const education = data.professionalInfo.education;
        
        // إذا كان المستخدم متفرغ كلياً ولديه مؤهل عالي، يمكن أن يكون موظف
        if (availability === 'full-time' && ['bachelor', 'master', 'phd'].includes(education)) {
            return 'employee';
        }
        
        // إذا كان لديه خبرة في العلاقات العامة أو الإعلام
        if (interests.includes('social') && data.professionalInfo.profession &&
            data.professionalInfo.profession.includes('إعلام') ||
            data.professionalInfo.profession.includes('علاقات')) {
            return 'pr_staff';
        }
        
        // افتراضياً، كل المسجلين الجدد يبدأون كمتطوعين
        return 'volunteer';
    }
    
    createUserAccount(data) {
        // إنشاء حساب مستخدم للنظام
        const username = data.personalInfo.fullName ? data.personalInfo.fullName.split(' ')[0] : 'مستخدم';
        const email = data.contactInfo.email || `user${Date.now()}@jamiyati.org`;
        
        return {
            id: 'USER_' + Date.now(),
            username: username,
            email: email,
            password: btoa('temp123'), // كلمة مرور مؤقتة
            role: data.role,
            center: data.preferredCenter || 'amman',
            joinDate: data.registrationDate,
            avatar: username.charAt(0).toUpperCase(),
            needsPasswordReset: true,
            registrationId: data.id
        };
    }
    async submitRegistration(data) {
        // محاكاة طلب الخادم
        return new Promise((resolve) => {
            setTimeout(() => {
                // حفظ البيانات في التخزين المحلي
                const registrations = JSON.parse(localStorage.getItem('jamiyati_registrations') || '[]');
                registrations.push(data);
                localStorage.setItem('jamiyati_registrations', JSON.stringify(registrations));
                
                // إضافة المستخدم إلى قاعدة بيانات المستخدمين
                const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
                users.push(data.userAccount);
                localStorage.setItem('jamiyati_users', JSON.stringify(users));
                
                // إرسال إشعار للمدير بالتسجيل الجديد
                this.notifyAdminOfNewRegistration(data);
                
                resolve(data);
            }, 2000);
        });
    }
    
    notifyAdminOfNewRegistration(data) {
        // إضافة إشعار للمدير
        const notifications = JSON.parse(localStorage.getItem('jamiyati_admin_notifications') || '[]');
        notifications.push({
            id: 'NOTIF_' + Date.now(),
            type: 'new_registration',
            title: 'تسجيل جديد في النظام',
            message: `تم تسجيل ${data.personalInfo.fullName} في النظام كـ ${this.getRoleDisplayName(data.role)}`,
            timestamp: new Date().toISOString(),
            read: false,
            registrationId: data.id,
            userId: data.userAccount.id
        });
        localStorage.setItem('jamiyati_admin_notifications', JSON.stringify(notifications));
    }
    
    getRoleDisplayName(role) {
        const roleNames = {
            'volunteer': 'متطوع',
            'employee': 'موظف',
            'pr_staff': 'موظف علاقات عامة',
            'center_manager': 'مدير مركز',
            'management': 'إدارة عليا',
            'admin': 'مدير نظام'
        };
        return roleNames[role] || 'مستخدم';
    }
    showLoadingState(loading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (loading) {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    }
    showSuccessMessage() {
        const successHtml = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h3>تم تسجيل طلبك بنجاح!</h3>
                <p>شكراً لك على انضمامك إلى جمعيتي. سيتم مراجعة طلبك والتواصل معك قريباً.</p>
                <p><strong>رقم الطلب:</strong> ${Date.now()}</p>
                <div class="success-actions">
                    <a href="index.html" class="btn btn-primary">العودة للرئيسية</a>
                    <button onclick="window.print()" class="btn btn-secondary">طباعة الإيصال</button>
                </div>
            </div>
        `;
        const container = document.querySelector('.registration-container');
        container.innerHTML = successHtml;
    }
    showErrorMessage(message) {
        // إزالة الرسائل السابقة
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.textContent = message;
        const container = document.querySelector('.registration-container');
        container.insertBefore(alert, container.firstChild);
        // التمرير لأعلى لإظهار الرسالة
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // إزالة الرسالة بعد 5 ثوان
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    confirmReset() {
        if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لن يمكن التراجع عن هذا الإجراء.')) {
            this.form.reset();
            localStorage.removeItem('jamiyati_registration_draft');
            
            // مسح رسائل الخطأ
            document.querySelectorAll('.field-error').forEach(error => error.remove());
            document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
            
            this.showSuccessAlert('تم مسح البيانات بنجاح');
        }
    }
    showSuccessAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        const container = document.querySelector('.registration-container');
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}
// تهيئة نظام التسجيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});