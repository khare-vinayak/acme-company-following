
const {Component} = React;
//const { HashRouter, Route, Switch, Link, Redirect } = ReactRouterDOM

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
       this.state = {
            user: {},
            companies: [],
            following:[],
            error:''
        }
        this.onUpdate = this.onUpdate.bind(this);
    }

    async onUpdate({rating, company}){
        try {
          this.setState({ error: ''});
          let following = this.state.following;
          const followed = this.state.following.find( followed => followed.companyId === company.id);
          if(followed){
            if(rating){
              const updated = (await axios.put(`${API}/users/${this.state.user.id}/followingCompanies/${ followed.id}`, { rating })).data;
              following = this.state.following.map(followed => {
                return followed.id === updated.id ? updated : followed
              });
            }
            else {
              await axios.delete(`${API}/users/${this.state.user.id}/followingCompanies/${ followed.id}`);
              following = this.state.following.filter(_followed => {
                return followed.id !== _followed.id;
              });
            }
          }
          else {
            const created = (await axios.post(`${API}/users/${this.state.user.id}/followingCompanies`, {
              rating,
              companyId: company.id
            })).data;
            following = [...this.state.following, created]; 
          }
          this.setState({ following });
        }
        catch(ex){
          this.setState({ error: ex.response.data.message });
        }
      }

    async componentDidMount(){
        const user = await fetchUser();
        const companies = (await axios.get(`${API}/companies`)).data;
        const following = (await axios.get(`${API}/users/${user.id}/followingCompanies`)).data;
        this.setState({ user, companies, following });
    }       

    render(){
        const { error, user, companies, following } = this.state;

        const { onUpdate } = this;

        if(!user.id){
            return null;
        }
          
        const rating=(company)=>{
            const found=following.find(followed=>followed.companyId===company.id);
            if(found){
                return found.rating;
            }
         return '';
        }
        
        return (
            <div>
                <h1>Acme Company Follower</h1>
                {
                !!error && <div className='error'>{ error }</div>
                }
                <h2>You ({user.fullName}) are following {following.length} Company</h2>
                <ul>
                    {
                        companies.map((company) => (
                        <li key={company.id} className= {rating(company)?'selected':'' } >
                            {company.name}
                            <select value={ rating(company)} onChange={ (ev)=> onUpdate({ rating: ev.target.value, company}) }>
                                {
                                    ['',1,2,3,4,5].map((value,idx)=>{
                                        return(
                                            <option key={idx} > {value} </option>
                                        )
                                    })
                                } 
                            </select>
                        </li>
                        ))
                    }
                    </ul>
            </div>
        )
    } 
}

const root = document.querySelector('#root');
ReactDOM.render(<App />,root);
