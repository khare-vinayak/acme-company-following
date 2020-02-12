const {Component} = React;

const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async ()=> {
    const storage = window.localStorage;
    const userId = storage.getItem('userId'); 
    if(userId){
    try {
        return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
        storage.removeItem('userId');
        return fetchUser();
    }
    }
    const user = (await axios.get(`${API}/users/random`)).data;
    storage.setItem('userId', user.id);
    return  user;
};

class App extends Component{
    constructor(){
        super();
       // this.state={
            //user=[],
         //   companies=[]
        }
    
    componentDidMount(){
        fetchUser.then(response=>console.log(response.data))
    }
    render(){
        return (
            <hr />
        ) ;
    } 
          
}

const root = document.querySelector('#root');
ReactDOM.render(<App />,root);
