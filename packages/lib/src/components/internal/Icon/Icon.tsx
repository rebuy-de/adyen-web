import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import getImageUrl from '../../../utils/get-image';
import cx from 'classnames';

interface IconProps {
    type: string;
    className?: string;
    alt?: string
}

const Icon = ({ type, className = '', alt = '' }: IconProps) => {
    const { loadingContext } = useCoreContext();
    const iconUrl = getImageUrl({ loadingContext, imageFolder: 'components/' })(type);

    return <img className={cx('adyen-checkout__icon', className)} alt={alt} src={iconUrl} />;
};

export default Icon;
