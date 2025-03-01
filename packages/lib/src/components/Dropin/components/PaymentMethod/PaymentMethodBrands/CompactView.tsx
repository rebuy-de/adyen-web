import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';

interface CompactViewProps {
    brands: Array<BrandConfiguration>;
    isPaymentMethodSelected: boolean;
}

const prepareVisibleBrands = (brands: Array<BrandConfiguration>) => {
    const visibleBrands = brands.length <= 4 ? brands : brands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: brands.length - visibleBrands.length
    };
};

const CompactView = ({ brands, isPaymentMethodSelected }: CompactViewProps) => {
    if (isPaymentMethodSelected) {
        return null;
    }

    const { visibleBrands, leftBrandsAmount } = prepareVisibleBrands(brands);
    return (
        <span className="adyen-checkout__payment-method__brands">
            {visibleBrands.map(brand => (
                <PaymentMethodIcon key={brand.name} altDescription={brand.name} type={brand.name} src={brand.icon} />
            ))}
            {leftBrandsAmount !== 0 && <span className="adyen-checkout__payment-method__brand-number">+{leftBrandsAmount}</span>}
        </span>
    );
};

export default CompactView;
