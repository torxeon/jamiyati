/* جمعيتي - نظام إدارة الأدوار والصلاحيات */
class RoleManager {
    constructor() {
        this.roles = {
            'admin': {
                name: 'مدير النظام',
                permissions: ['*'], // جميع الصلاحيات
                level: 5,
                features: ['dashboard', 'centers', 'departments', 'notifications', 'suggestions', 'campaigns', 'users', 'reports', 'settings']
            },
            'management': {
                name: 'الإدارة العليا',
                permissions: ['read_all', 'write_reports', 'manage_centers', 'view_suggestions', 'manage_campaigns'],
                level: 4,
                features: ['dashboard', 'centers', 'departments', 'notifications', 'campaigns', 'reports']
            },
            'center_manager': {
                name: 'مدير مركز',
                permissions: ['read_center', 'write_center', 'manage_staff', 'view_notifications'],
                level: 3,
                features: ['dashboard', 'centers', 'departments', 'notifications', 'suggestions']
            },
            'pr_staff': {
                name: 'موظف علاقات عامة',
                permissions: ['read_public', 'write_content', 'manage_campaigns', 'view_suggestions'],
                level: 2,
                features: ['dashboard', 'centers', 'departments', 'notifications', 'campaigns']
            },
            'employee': {
                name: 'موظف',
                permissions: ['read_basic', 'view_notifications'],
                level: 1,
                features: ['dashboard', 'centers', 'departments', 'notifications']
            },
            'volunteer': {
                name: 'متطوع',
                permissions: ['read_basic'],
                level: 0,
                features: ['dashboard', 'centers', 'notifications']
            }
        };
        
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadCurrentUser();
        this.applyRoleRestrictions();
        this.setupRoleInterface();
    }
    
    loadCurrentUser() {
        const userData = localStorage.getItem('jamiyati_current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            // إذا لم يكن للمستخدم دور محدد، اعطه دور متطوع افتراضياً
            if (!this.currentUser.role) {
                this.currentUser.role = 'volunteer';
                this.updateUserData(this.currentUser);
            }
        }
    }
    
    updateUserData(userData) {
        localStorage.setItem('jamiyati_current_user', JSON.stringify(userData));
        this.currentUser = userData;
    }
    
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }
        
        const userRole = this.roles[this.currentUser.role];
        if (!userRole) {
            return false;
        }
        
        // المدير لديه جميع الصلاحيات
        if (userRole.permissions.includes('*')) {
            return true;
        }
        
        return userRole.permissions.includes(permission);
    }
    
    hasFeatureAccess(feature) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }
        
        const userRole = this.roles[this.currentUser.role];
        if (!userRole) {
            return false;
        }
        
        return userRole.features.includes(feature);
    }
    
    canAccessSection(sectionId) {
        const sectionPermissions = {
            'home': 'read_basic',
            'centers': 'read_basic',
            'departments': 'read_basic',
            'notifications': 'read_basic',
            'suggestions': 'read_public',
            'campaigns': 'read_public'
        };
        
        const requiredPermission = sectionPermissions[sectionId];
        return requiredPermission ? this.hasPermission(requiredPermission) : false;
    }
    
    applyRoleRestrictions() {
        if (!this.currentUser) {
            return;
        }
        
        // إخفاء الأقسام غير المسموحة
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                if (!this.hasFeatureAccess(sectionId)) {
                    link.style.display = 'none';
                }
            }
        });
        
        // إخفاء المحتوى المحظور
        this.hideRestrictedContent();
        
        // تطبيق فلترة المراكز
        this.filterCentersByAccess();
        
        // إضافة مؤشرات الدور
        this.addRoleIndicators();
        
        // إضافة واجهة إدارة الأدوار للمديرين
        if (this.hasPermission('*')) {
            this.addAdminRoleInterface();
        }
    }
    
    hideRestrictedContent() {
        // إخفاء أزرار الإدارة حسب الصلاحيات
        const adminButtons = document.querySelectorAll('[data-permission]');
        adminButtons.forEach(button => {
            const permission = button.getAttribute('data-permission');
            if (!this.hasPermission(permission)) {
                button.style.display = 'none';
            }
        });
        
        // إخفاء معلومات الاتصال للأقسام (حسب المستوى)
        if (!this.hasPermission('view_contacts')) {
            const contactInfo = document.querySelectorAll('.department-manager');
            contactInfo.forEach(info => {
                const phoneElements = info.querySelectorAll('br');
                phoneElements.forEach(br => {
                    if (br.nextSibling && br.nextSibling.textContent.includes('الهاتف:')) {
                        br.nextSibling.style.display = 'none';
                        br.style.display = 'none';
                    }
                    if (br.nextSibling && br.nextSibling.textContent.includes('البريد:')) {
                        br.nextSibling.style.display = 'none';
                        br.style.display = 'none';
                    }
                });
            });
        }
    }
    
    addRoleIndicators() {
        const userRole = this.roles[this.currentUser.role];
        if (!userRole) return;
        
        // إضافة مؤشر الدور في الهيدر
        const userInfo = document.querySelector('.user-info');
        if (userInfo && !userInfo.querySelector('.role-badge')) {
            const roleBadge = document.createElement('span');
            roleBadge.className = 'role-badge';
            roleBadge.textContent = userRole.name;
            roleBadge.style.cssText = `
                background: #667eea;
                color: white;
                padding: 0.2rem 0.6rem;
                border-radius: 10px;
                font-size: 0.8rem;
                margin-left: 0.5rem;
            `;
            userInfo.insertBefore(roleBadge, userInfo.querySelector('.logout-btn'));
        }
    }
    
    setupRoleInterface() {
        // إضافة واجهة تبديل الأدوار للاختبار (فقط للمطورين)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addDeveloperControls();
        }
    }
    
    addDeveloperControls() {
        const devControls = document.createElement('div');
        devControls.style.cssText = `
            position: fixed;
            top: 100px;
            left: 20px;
            background: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 200px;
        `;
        
        devControls.innerHTML = `
            <h4 style="margin: 0 0 1rem 0; color: #333;">أدوات المطور</h4>
            <label style="display: block; margin-bottom: 0.5rem; color: #666;">تبديل الدور:</label>
            <select id="roleSelector" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 5px;">
                ${Object.keys(this.roles).map(roleKey => 
                    `<option value="${roleKey}" ${this.currentUser.role === roleKey ? 'selected' : ''}>${this.roles[roleKey].name}</option>`
                ).join('')}
            </select>
            <button id="applyRole" style="width: 100%; margin-top: 0.5rem; padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">تطبيق</button>
        `;
        
        document.body.appendChild(devControls);
        
        // ربط الأحداث
        document.getElementById('applyRole').addEventListener('click', () => {
            const newRole = document.getElementById('roleSelector').value;
            this.switchRole(newRole);
        });
    }
    
    switchRole(newRole) {
        if (this.roles[newRole]) {
            this.currentUser.role = newRole;
            this.updateUserData(this.currentUser);
            
            // إعادة تحميل الصفحة لتطبيق الصلاحيات الجديدة
            window.location.reload();
        }
    }
    
    getRoleLevel(role) {
        return this.roles[role] ? this.roles[role].level : -1;
    }
    
    canManageUser(targetRole) {
        const currentLevel = this.getRoleLevel(this.currentUser.role);
        const targetLevel = this.getRoleLevel(targetRole);
        
        return currentLevel > targetLevel;
    }
    
    getAccessibleCenters() {
        if (!this.currentUser) return [];
        
        if (this.hasPermission('*') || this.hasPermission('read_all')) {
            // المدير والإدارة العليا يمكنهم رؤية جميع المراكز
            return ['amman', 'irbid', 'zarqa', 'karak', 'aqaba'];
        } else if (this.hasPermission('read_center')) {
            // مدير المركز يرى مركزه فقط
            return [this.currentUser.center || 'amman'];
        } else {
            // الموظفون والمتطوعون يرون المراكز العامة
            return ['amman', 'irbid', 'zarqa'];
        }
    }
    
    filterCentersByAccess() {
        const accessibleCenters = this.getAccessibleCenters();
        const centerCards = document.querySelectorAll('.center-card');
        
        centerCards.forEach(card => {
            const centerGovernorate = card.getAttribute('data-governorate');
            if (!accessibleCenters.includes(centerGovernorate)) {
                card.style.display = 'none';
            }
        });
    }
    
    // دالة للتحقق من صلاحية إرسال الاقتراحات
    canSubmitSuggestions() {
        return this.hasPermission('read_public') || this.hasPermission('write_content');
    }
    
    // دالة للتحقق من صلاحية عرض الحملات
    canViewCampaigns() {
        return this.hasFeatureAccess('campaigns');
    }
    
    // إضافة أدوار جديدة (للمدير فقط)
    createRole(roleKey, roleData) {
        if (!this.hasPermission('*')) {
            throw new Error('غير مسموح لك بإنشاء أدوار جديدة');
        }
        
        this.roles[roleKey] = roleData;
        this.saveRoles();
    }
    
    // حفظ الأدوار (للاستخدام المستقبلي مع قاعدة البيانات)
    saveRoles() {
        localStorage.setItem('jamiyati_roles', JSON.stringify(this.roles));
    }
    
    // تحميل الأدوار (للاستخدام المستقبلي مع قاعدة البيانات)
    loadRoles() {
        const savedRoles = localStorage.getItem('jamiyati_roles');
        if (savedRoles) {
            this.roles = { ...this.roles, ...JSON.parse(savedRoles) };
        }
    }
    
    // إضافة واجهة إدارة الأدوار للمديرين
    addAdminRoleInterface() {
        if (document.getElementById('adminRolePanel')) {
            return; // الواجهة موجودة بالفعل
        }
        
        const adminPanel = document.createElement('div');
        adminPanel.id = 'adminRolePanel';
        adminPanel.style.cssText = `
            position: fixed;
            top: 150px;
            left: 20px;
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1001;
            min-width: 250px;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        adminPanel.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">إدارة الأدوار</h4>
                <button id="closeAdminPanel" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
            </div>
            <div id="pendingRegistrations"></div>
            <div id="userRoleManagement"></div>
        `;
        
        document.body.appendChild(adminPanel);
        
        // ربط إغلاق اللوحة
        document.getElementById('closeAdminPanel').addEventListener('click', () => {
            adminPanel.remove();
        });
        
        // تحميل التسجيلات المعلقة
        this.loadPendingRegistrations();
        
        // تحميل إدارة أدوار المستخدمين
        this.loadUserRoleManagement();
    }
    
    loadPendingRegistrations() {
        const registrations = JSON.parse(localStorage.getItem('jamiyati_registrations') || '[]');
        const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
        
        const container = document.getElementById('pendingRegistrations');
        if (pendingRegistrations.length === 0) {
            container.innerHTML = '<p style="color: #666; font-size: 0.9rem;">لا توجد تسجيلات معلقة</p>';
            return;
        }
        
        container.innerHTML = `
            <h5 style="color: #333; margin-bottom: 0.5rem;">التسجيلات المعلقة (${pendingRegistrations.length})</h5>
            <div style="max-height: 200px; overflow-y: auto;">
                ${pendingRegistrations.map(reg => `
                    <div style="border: 1px solid #ddd; border-radius: 5px; padding: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8rem;">
                        <strong>${reg.personalInfo.fullName}</strong>
                        <div style="color: #666;">دور مقترح: ${this.getRoleDisplayName(reg.role)}</div>
                        <div style="margin-top: 0.5rem;">
                            <button onclick="window.roleManager.approveRegistration('${reg.id}')" style="background: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 3px; font-size: 0.7rem; margin-left: 5px;">موافقة</button>
                            <button onclick="window.roleManager.rejectRegistration('${reg.id}')" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 3px; font-size: 0.7rem;">رفض</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    loadUserRoleManagement() {
        const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
        const container = document.getElementById('userRoleManagement');
        
        container.innerHTML = `
            <h5 style="color: #333; margin: 1rem 0 0.5rem 0;">إدارة أدوار المستخدمين</h5>
            <div style="max-height: 200px; overflow-y: auto;">
                ${users.map(user => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee; font-size: 0.8rem;">
                        <div>
                            <strong>${user.username}</strong>
                            <div style="color: #666;">${this.getRoleDisplayName(user.role)}</div>
                        </div>
                        <select onchange="window.roleManager.changeUserRole('${user.id}', this.value)" style="font-size: 0.7rem; padding: 2px;">
                            ${Object.keys(this.roles).map(roleKey =>
                                `<option value="${roleKey}" ${user.role === roleKey ? 'selected' : ''}>${this.roles[roleKey].name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    approveRegistration(registrationId) {
        const registrations = JSON.parse(localStorage.getItem('jamiyati_registrations') || '[]');
        const registration = registrations.find(reg => reg.id === registrationId);
        
        if (registration) {
            registration.status = 'approved';
            localStorage.setItem('jamiyati_registrations', JSON.stringify(registrations));
            
            // تفعيل حساب المستخدم
            const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
            const user = users.find(u => u.registrationId === registrationId);
            if (user) {
                user.status = 'active';
                localStorage.setItem('jamiyati_users', JSON.stringify(users));
            }
            
            this.loadPendingRegistrations();
            alert('تم قبول التسجيل بنجاح');
        }
    }
    
    rejectRegistration(registrationId) {
        if (confirm('هل أنت متأكد من رفض هذا التسجيل؟')) {
            const registrations = JSON.parse(localStorage.getItem('jamiyati_registrations') || '[]');
            const registration = registrations.find(reg => reg.id === registrationId);
            
            if (registration) {
                registration.status = 'rejected';
                localStorage.setItem('jamiyati_registrations', JSON.stringify(registrations));
                
                // حذف حساب المستخدم
                const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
                const filteredUsers = users.filter(u => u.registrationId !== registrationId);
                localStorage.setItem('jamiyati_users', JSON.stringify(filteredUsers));
                
                this.loadPendingRegistrations();
                alert('تم رفض التسجيل');
            }
        }
    }
    
    changeUserRole(userId, newRole) {
        const users = JSON.parse(localStorage.getItem('jamiyati_users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (user) {
            user.role = newRole;
            localStorage.setItem('jamiyati_users', JSON.stringify(users));
            
            // إذا كان المستخدم الحالي، تحديث الجلسة
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser.role = newRole;
                this.updateUserData(this.currentUser);
                window.location.reload(); // إعادة تحميل لتطبيق الصلاحيات الجديدة
            }
            
            alert('تم تغيير دور المستخدم بنجاح');
        }
    }
    
    getRoleDisplayName(role) {
        return this.roles[role] ? this.roles[role].name : role;
    }
}
// إنشاء مثيل عام لمدير الأدوار
window.roleManager = new RoleManager();
// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleManager;
}