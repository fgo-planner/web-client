import { CustomPureComponent } from './custom-pure-component';

type Props = {
    open: boolean;
};

export abstract class ModalComponent<P extends Props, S = {}> extends CustomPureComponent<P, S> {
    
    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>): boolean {
        const { open } = this.props;
        if (!open && !nextProps.open) {
            return false;
        }
        return super.shouldComponentUpdate(nextProps, nextState);
    }

}
