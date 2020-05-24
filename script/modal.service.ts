import {
    Injectable,
    Injector,
    ApplicationRef,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ComponentRef,
    Component,
    TemplateRef
} from "@angular/core";
import { ModalComponent } from "./modal.component";
import { Subject } from "rxjs";

@Injectable()
export class ModalService {
    private modalRef: ComponentRef<ModalComponent>;
    public clearRequested$: Subject<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private applicationRef: ApplicationRef, private injector: Injector) {
    }

    public showModal(componentOrTemplate: Component | TemplateRef<any>) {
        let instance = this.createModal();
        instance.componentOrTemplate = componentOrTemplate;
        this.clearRequested$ = instance.clearRequested$;
        return instance.componentCreated$;
    }

    private createModal() {
        let factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        let ref = factory.create(this.injector);
        let rootNode = (ref.hostView as EmbeddedViewRef<ModalComponent>).rootNodes[0];
        this.applicationRef.attachView(ref.hostView);
        ref.onDestroy = () => {
            this.applicationRef.detachView(ref.hostView);
        };
        document.body.appendChild(rootNode);
        this.modalRef = ref;
        return ref.instance;
    }

    public clear() {
        if(this.modalRef) {
            // this.applicationRef.detachView(this.modalRef.hostView);
            this.modalRef.destroy();
        }
    }
}