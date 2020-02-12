const {Component} = React;
const { HashRouter, Route, Switch, Link, Redirect } = ReactRouterDOM

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

const Companylist = ({companies}) => {
    return (
        <div>
            {
                companies.map((company, idx) => {
                    return (
                            <div key={idx}>
                                {company.name}
                                <select value={company.name}></select>
                            </div>
                        
                    )
                })
            }
        </div>
        
        
    )
}

class App extends Component{
    constructor(){
        super();
       this.state = {
            user: {},
            companies: []
        }
    }
    
    componentDidMount() {
        fetchUser()
            .then( user => {
                this.setState({user})
            })
        axios.get(`${API}/companies`)
            .then(response => this.setState({companies: response.data}))
    }

    render(){
        const {user, companies} = this.state
        return (
            <div>
                <h1>Acme Company Follower</h1>
                <h2>You ({user.fullName}) are following 3 Company</h2>
                <HashRouter>
                    <Route render={() => <Companylist companies={companies}/>} /> 

                </HashRouter>




            </div>
        ) ;
    } 
          
}

const root = document.querySelector('#root');
ReactDOM.render(<App />,root);
