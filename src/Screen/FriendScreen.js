import React,{Component} from 'react'

import {
    Toast,
    NavBar,
    ListView,
    PullToRefresh,
    SearchBar
}from 'antd-mobile';

import accoutManager from '../DataSerever/AccountManager';
import friendManager from '../DataServer/FriendManager';

import FriendListItem from '../ViewComponent/FriendListItem';
import { fastest } from 'sw-toolbox';

export default class FriendScreen extends Component{
    async componentDidMount(){
        if(accountManager.isLogin()===false){
            return;
        }
        const result =await friendManager.getFllows()
        if(result.success ===false){
            Toast.fail(result.errorMessage);
            return;
        }
        this.setState((preState)=>{
            return{
                dataSource:preState.dataSource.cloneWithRows(result.data)
            }
        })
    }

    constructor(props){
        super(props)
        const dataSource = new ListView.DataSource({
            rowHasChanged:(row1,row2)=>row1!==row2,
        })

        this.state={
            dataSource,
            refreshing:false,
            nickname:'',
            isSearchData:false,
        }
    }

    onRefresh = async()=>{
        try{
            this.setState({refreshing:true});
            const result = await friendManager.getFllows()
            if(result.success ===false){
                Toast.fail(result.errorMessage);
                this.setState({refreshing:false});
                return;
            }
            this.setState((preState)=>{
                return{
                    dataSource:preState.dataSource.cloneWithRows(result.data),
                    refreshing:false
                }
            })
        }catch(error){
            Toast.fail(`${error}`);
            this.setState({refreshing:false});
        }
    }

    onSearch = async ()=>{
        this.setState({
            isSearchData:true,
        })
        Toast.loading('查询中，请稍后',0);
        const result = await friendManager.findUser(this.state.nickname);
        Toast.hide();

        if(result.success ===false){
            Toast.fail(result.errorMessage,1);
            return;
        }

        this.setState((preState)=>{
            return{
                dataSource:preState.dataSource.cloneWithRows(result.data)
            }
        })
    }

    onCancle = async()=>{
        this.setState({
            nickname:'',
            isSearchData:false
        })
        const result = await friendManager.getFollows()
        if(result.success === false){
            Toast.fail(result.errorMessage);
            return;
        }
        this.setState((preState)=>{
            return{
                dataSource:preState.dataSource.cloneWithRows(result.data)
            }
        })
    }

    onDel=async (id)=>{
        Toast.loading('操作中',0);
        const result =await friendManager.unFollow(id);
        Toast.hide();

        if(result.success=== false){
            Toast.fail(result.errorMessage,1);
            return;
        }

        const result1 =await friendManager.getFollows();
        if(result.success ===false){
            Toast.fail(result.errorMessage,1);
            return;
        }

        this.setState((preState)=>{
            return{
                dataSource:preState.dataSource.cloneWithRows(result.data)
            }
        },()=>{
            Toast.hide();
        })
    }
    render(){
        return(
            <div>
                <NavBar
                    mode='dark'
                    >朋友</NavBar>
                    <SearchBar
                        placeholder={'请输入好友昵称'}
                        value={this.state.nickname}
                        onChange={(nickname)=>{this.setState({nickname})}}
                        onSubmit={this.onSearch}
                        onCancle={this.onCancle}
                    />
                    <ListView
                        useBodyScroll={true}
                        dataSource={this.state.dataSource}
                        PullToRefresh={
                            this.state.isSearchData?null :(
                                <PullToRefresh
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.onRefresh}
                                />
                            )
                        }
                        renderRow={(user)=>{
                            return(
                                <FriendListItem
                                    {...user}
                                    onItemClick={()=>{
                                        this.props.history.push('/UserScreen',user)
                                    }}
                                    del={this.onDel}
                                />
                            )
                        }}
                        />
            </div>
        )
    }

}