/* جمعيتي - بيانات اختبار للنظام */
// إعداد بيانات اختبار للأدوار والمستخدمين
function initializeTestData() {
    // بيانات المستخدمين الاختبارية
    const testUsers = [
        {
            id: 'USER_ADMIN_001',
            username: 'المدير العام',
            email: 'admin@jamiyati.org',
            password: btoa('admin123'),
            role: 'admin',
            center: 'amman',
            joinDate: new Date('2023-01-01').toISOString(),
            avatar: 'م',
            status: 'active'
        },
        {
            id: 'USER_MANAGER_001',
            username: 'أحمد المدير',
            email: 'manager@jamiyati.org',
            password: btoa('manager123'),
            role: 'center_manager',
            center: 'amman',
            joinDate: new Date('2023-02-15').toISOString(),
            avatar: 'أ',
            status: 'active'
        },
        {
            id: 'USER_PR_001',
            username: 'سارة العلاقات',
            email: 'pr@jamiyati.org',
            password: btoa('pr123'),
            role: 'pr_staff',
            center: 'irbid',
            joinDate: new Date('2023-03-20').toISOString(),
            avatar: 'س',
            status: 'active'
        },
        {
            id: 'USER_EMP_001',
            username: 'محمد الموظف',
            email: 'employee@jamiyati.org',
            password: btoa('emp123'),
            role: 'employee',
            center: 'zarqa',
            joinDate: new Date('2023-04-10').toISOString(),
            avatar: 'م',
            status: 'active'
        },
        {
            id: 'USER_VOL_001',
            username: 'فاطمة المتطوعة',
            email: 'volunteer@jamiyati.org',
            password: btoa('vol123'),
            role: 'volunteer',
            center: 'karak',
            joinDate: new Date('2023-05-05').toISOString(),
            avatar: 'ف',
            status: 'active'
        }
    ];
    // بيانات التسجيلات الاختبارية (معلقة)
    const testRegistrations = [
        {
            id: 'REG_001',
            personalInfo: {
                fullName: 'خالد أحمد المحمود',
                nationalId: '1234567890',
                birthDate: '1990-05-15',
                gender: 'male',
                maritalStatus: 'married'
            },
            contactInfo: {
                phoneNumber: '0791234567',
                email: 'khalid@example.com'
            },
            professionalInfo: {
                education: 'bachelor',
                profession: 'مهندس',
                workplace: 'شركة التقنية المتقدمة'
            },
            preferences: {
                interests: ['education', 'social']
            },
            address: 'عمان، الجبيهة، شارع الملك حسين',
            city: 'amman',
            preferredCenter: 'amman',
            role: 'employee',
            status: 'pending',
            registrationDate: new Date().toISOString(),
            userAccount: {
                id: 'USER_REG_001',
                username: 'خالد',
                email: 'khalid@example.com',
                password: btoa('temp123'),
                role: 'employee',
                center: 'amman',
                joinDate: new Date().toISOString(),
                avatar: 'خ',
                needsPasswordReset: true,
                registrationId: 'REG_001'
            }
        },
        {
            id: 'REG_002',
            personalInfo: {
                fullName: 'ليلى سعد النجار',
                nationalId: '9876543210',
                birthDate: '1985-08-20',
                gender: 'female',
                maritalStatus: 'single'
            },
            contactInfo: {
                phoneNumber: '0795678901',
                email: 'layla@example.com'
            },
            professionalInfo: {
                education: 'master',
                profession: 'أخصائية اجتماعية',
                workplace: 'وزارة التنمية الاجتماعية'
            },
            preferences: {
                interests: ['social', 'health']
            },
            address: 'إربد، وسط البلد، شارع الجامعة',
            city: 'irbid',
            preferredCenter: 'irbid',
            role: 'pr_staff',
            status: 'pending',
            registrationDate: new Date().toISOString(),
            userAccount: {
                id: 'USER_REG_002',
                username: 'ليلى',
                email: 'layla@example.com',
                password: btoa('temp123'),
                role: 'pr_staff',
                center: 'irbid',
                joinDate: new Date().toISOString(),
                avatar: 'ل',
                needsPasswordReset: true,
                registrationId: 'REG_002'
            }
        }
    ];
    // حفظ البيانات الاختبارية
    localStorage.setItem('jamiyati_users', JSON.stringify(testUsers));
    localStorage.setItem('jamiyati_registrations', JSON.stringify(testRegistrations));
    console.log('تم تحميل البيانات الاختبارية بنجاح!');
    console.log('المستخدمون المتاحون:');
    testUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - دور: ${user.role}`);
    });
}
// تحميل البيانات عند بدء التشغيل إذا لم تكن موجودة
function loadTestDataIfNeeded() {
    const existingUsers = localStorage.getItem('jamiyati_users');
    const existingRegistrations = localStorage.getItem('jamiyati_registrations');
    
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
        initializeTestData();
        return true;
    }
    return false;
}
// إعادة تعيين البيانات الاختبارية
function resetTestData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات وإعادة تحميل البيانات الاختبارية؟')) {
        localStorage.removeItem('jamiyati_users');
        localStorage.removeItem('jamiyati_registrations');
        localStorage.removeItem('jamiyati_current_user');
        localStorage.removeItem('jamiyati_admin_notifications');
        
        initializeTestData();
        alert('تم إعادة تعيين البيانات الاختبارية. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = 'login_register.html';
    }
}
// تصدير الدوال للاستخدام العام
window.initializeTestData = initializeTestData;
window.loadTestDataIfNeeded = loadTestDataIfNeeded;
window.resetTestData = resetTestData;
// تحميل البيانات تلقائياً عند تحميل الملف
document.addEventListener('DOMContentLoaded', () => {
    if (loadTestDataIfNeeded()) {
        console.log('✅ تم تحميل البيانات الاختبارية الجديدة');
    } else {
        console.log('ℹ️ البيانات الاختبارية موجودة مسبقاً');
    }
    
    // إضافة أزرار المطور في البيئة المحلية
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addDeveloperButtons();
    }
});
function addDeveloperButtons() {
    const devButtonsContainer = document.createElement('div');
    devButtonsContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 2000;
    `;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 إعادة تعيين البيانات';
    resetBtn.onclick = resetTestData;
    resetBtn.style.cssText = `
        padding: 8px 12px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    `;
    
    const usersBtn = document.createElement('button');
    usersBtn.textContent = '👥 عرض المستخدمين';
    usersBtn.onclick = () => {
        const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
        console.table(users);
        alert(`عدد المستخدمين: ${users.length}. تحقق من الكونسول للتفاصيل.`);
    };
    usersBtn.style.cssText = `
        padding: 8px 12px;
        background: #17a2b8;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.8rem;
    `;
    
    devButtonsContainer.appendChild(resetBtn);
    devButtonsContainer.appendChild(usersBtn);
    document.body.appendChild(devButtonsContainer);
}