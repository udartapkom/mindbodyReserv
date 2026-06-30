import SupportHead from '@/components/SupportHead/SupportHead';
import SupportCardSection from '@/components/SupportCardSection/SupportCardSection';
import WhatWrite from '@/components/WhatWrite/WhatWrite';
import FaqSupportSection from '@/components/FaqSupportSection/FaqSupportSection';
import SupportContactSection from '@/components/SupportContactSection/SupportContactSection';

function SupportPage() {
    return (
        <>
            <SupportHead />
            <SupportCardSection />
            <WhatWrite />
            <FaqSupportSection />
            <SupportContactSection />
        </>
    );
}

export default SupportPage;