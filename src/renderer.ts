import '../index.css';
import {Pages, routeToPage} from "./display/routing";
import {addSubscription, ListenerEndpoints} from "./display/state/state-manager";

routeToPage(Pages.Main);



addSubscription(ListenerEndpoints.AllMessdiener, data => new Promise<void>((resolve) => {
    console.log(data)
    resolve()
}))
