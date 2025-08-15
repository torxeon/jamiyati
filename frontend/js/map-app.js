// Interactive functionality for Jordan map
document.addEventListener('DOMContentLoaded', function() {
    const governorates = document.querySelectorAll('.governorate');
    const tooltip = document.getElementById('tooltip');
    let activeGovernorate = null;
    // Governorate data for additional information
    const governorateInfo = {
        'إربد': {
            name: 'إربد',
            region: 'الشمال',
            description: 'محافظة إربد - المنطقة الشمالية'
        },
        'عجلون': {
            name: 'عجلون',
            region: 'الشمال',
            description: 'محافظة عجلون - المنطقة الشمالية'
        },
        'جرش': {
            name: 'جرش',
            region: 'الشمال',
            description: 'محافظة جرش - المنطقة الشمالية'
        },
        'المفرق': {
            name: 'المفرق',
            region: 'الشمال',
            description: 'محافظة المفرق - المنطقة الشمالية'
        },
        'العاصمة': {
            name: 'العاصمة',
            region: 'الوسط',
            description: 'محافظة العاصمة - المنطقة الوسطى'
        },
        'الزرقاء': {
            name: 'الزرقاء',
            region: 'الوسط',
            description: 'محافظة الزرقاء - المنطقة الوسطى'
        },
        'البلقاء': {
            name: 'البلقاء',
            region: 'الوسط',
            description: 'محافظة البلقاء - المنطقة الوسطى'
        },
        'مادبا': {
            name: 'مادبا',
            region: 'الوسط',
            description: 'محافظة مادبا - المنطقة الوسطى'
        },
        'الكرك': {
            name: 'الكرك',
            region: 'الجنوب',
            description: 'محافظة الكرك - المنطقة الجنوبية'
        },
        'الطفيلة': {
            name: 'الطفيلة',
            region: 'الجنوب',
            description: 'محافظة الطفيلة - المنطقة الجنوبية'
        },
        'معان': {
            name: 'معان',
            region: 'الجنوب',
            description: 'محافظة معان - المنطقة الجنوبية'
        },
        'العقبة': {
            name: 'العقبة',
            region: 'الجنوب',
            description: 'محافظة العقبة - المنطقة الجنوبية'
        }
    };
    // Add event listeners to each governorate
    governorates.forEach(governorate => {
        const name = governorate.getAttribute('data-name');
        
        // Click event - highlight governorate
        governorate.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from previous selection
            if (activeGovernorate) {
                activeGovernorate.classList.remove('active');
            }
            
            // Add active class to current selection
            if (activeGovernorate === this) {
                // If clicking the same governorate, deselect it
                activeGovernorate = null;
            } else {
                this.classList.add('active');
                activeGovernorate = this;
            }
        });
        
        // Mouse enter event - show tooltip
        governorate.addEventListener('mouseenter', function(e) {
            const info = governorateInfo[name];
            if (info) {
                tooltip.textContent = info.description;
                tooltip.classList.remove('hidden');
                updateTooltipPosition(e);
            }
        });
        
        // Mouse move event - update tooltip position
        governorate.addEventListener('mousemove', function(e) {
            updateTooltipPosition(e);
        });
        
        // Mouse leave event - hide tooltip
        governorate.addEventListener('mouseleave', function() {
            tooltip.classList.add('hidden');
        });
    });
    // Function to update tooltip position
    function updateTooltipPosition(e) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = e.clientX + 10;
        let top = e.clientY - 10;
        
        // Adjust position if tooltip would go off screen
        if (left + tooltipRect.width > viewportWidth) {
            left = e.clientX - tooltipRect.width - 10;
        }
        
        if (top + tooltipRect.height > viewportHeight) {
            top = e.clientY - tooltipRect.height - 10;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Press Escape to deselect all governorates
        if (e.key === 'Escape' && activeGovernorate) {
            activeGovernorate.classList.remove('active');
            activeGovernorate = null;
        }
    });
    // Add focus management for accessibility
    governorates.forEach(governorate => {
        // Make governorates focusable
        governorate.setAttribute('tabindex', '0');
        governorate.setAttribute('role', 'button');
        governorate.setAttribute('aria-label', `محافظة ${governorate.getAttribute('data-name')}`);
        
        // Handle keyboard interaction
        governorate.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Focus events
        governorate.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--color-primary)';
            this.style.outlineOffset = '2px';
        });
        
        governorate.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    // Add legend interaction
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const symbolClass = this.querySelector('.legend-symbol').classList[1];
            const mapSymbols = document.querySelectorAll(`.map-symbol.${symbolClass}`);
            
            mapSymbols.forEach(symbol => {
                symbol.style.transform = 'scale(1.3)';
                symbol.style.transition = 'transform 0.2s ease';
            });
        });
        
        item.addEventListener('mouseleave', function() {
            const symbolClass = this.querySelector('.legend-symbol').classList[1];
            const mapSymbols = document.querySelectorAll(`.map-symbol.${symbolClass}`);
            
            mapSymbols.forEach(symbol => {
                symbol.style.transform = 'scale(1)';
            });
        });
    });
    // Responsive adjustments
    function handleResize() {
        const mapContainer = document.querySelector('.map-container');
        const windowWidth = window.innerWidth;
        
        if (windowWidth < 768) {
            mapContainer.style.flexDirection = 'column';
            mapContainer.style.alignItems = 'center';
        } else {
            mapContainer.style.flexDirection = 'row';
            mapContainer.style.alignItems = 'flex-start';
        }
    }
    // Initial resize check
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
});