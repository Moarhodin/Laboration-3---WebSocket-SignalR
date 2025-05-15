using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using ChatApp.Models; 
using ChatApp.DataService;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        private readonly SharedDb _sharedDb;

        public ChatHub(SharedDb sharedDb)
        {
            _sharedDb = sharedDb;
        }

	public async Task JoinChatRoom(string userName, string chatRoom, string chatRole)
		{
		await Groups.AddToGroupAsync(Context.ConnectionId, chatRoom);
		_sharedDb.Connection[Context.ConnectionId] = new UserConnection { UserName = userName, ChatRoom = chatRoom, ChatRole = chatRole };

		// Skicka meddelande till gruppen när någon går med, inklusive rollen.
		await Clients.Group(chatRoom).SendAsync("ReceiveMessage", "admin", $"{userName} ({chatRole}) has joined the chat room {chatRoom}");
		}


	public async Task LeaveChatRoom(string userName, string chatRoom)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatRoom);
            await Clients.Group(chatRoom).SendAsync("ReceiveMessage", "admin", $"{userName} has left the chat room {chatRoom}");
	    _sharedDb.Connection.TryRemove(Context.ConnectionId, out _);
        }

	public async Task SendMessage(string chatRoom, string userName, string chatRole, string message)
	{

		if (chatRoom == "Announcement" && chatRole != "teacher")
		{
			await Clients.Caller.SendAsync("ReceiveMessage", "admin", "Only teachers can send messages in the Announcement room.");
			return;
		}

		await Clients.Group(chatRoom).SendAsync("ReceiveMessage", $"{userName} ({chatRole})", message);
	}
    }
}